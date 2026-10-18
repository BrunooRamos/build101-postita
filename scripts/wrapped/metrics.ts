// build 101 wrapped — script de ingesta. Corre en la máquina de un organizador:
//
//   npm run metrics                  # clona/actualiza, calcula y publica
//   npm run metrics -- --no-publish  # solo escribe .data/wrapped-metrics.json
//   npm run metrics -- --offline     # no hace fetch: usa los clones que ya hay
//   CIERRE=13:30 npm run metrics     # pisa la hora de cierre de código
//
// Lee wrapped/repos.json y wrapped/hidden.json, clona cada repo con
// --filter=blob:none en .data/wrapped-repos/, saca casi todo de `git log` local
// y usa la API de GitHub solo para lenguajes y PRs. El resultado (ya agregado y
// filtrado) es lo único que lee la página: se escribe en .data/ y, si hay
// credenciales de Redis, se publica para /api/wrapped.
//
// Variables: GITHUB_TOKEN (o `gh auth token`), INVESTMENTS_REDIS_REST_URL/TOKEN
// (o UPSTASH_/KV_), ANTHROPIC_API_KEY (opcional: elige los commits graciosos).
// Se cargan también de .env.local. El token nunca se imprime ni va a disco:
// git lo pide a un credential helper que lo lee del entorno (ni en la URL, ni
// en los argumentos, ni en .git/config).

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import Anthropic from "@anthropic-ai/sdk";
import { CODE_FREEZE_ISO, EVENT_KICKOFF_ISO } from "../../app/event.ts";
import { WRAPPED_KEY, WRAPPED_LOCAL_FILE, redis, redisConfiguration } from "../../lib/wrapped-store.ts";
import type { Ranked, WrappedMetrics } from "../../lib/wrapped-types.ts";
import { type Hidden, makeShowFilter, normalize, wordIsShowable } from "./filters.ts";

const run = promisify(execFile);
const ROOT = process.cwd();
const DATA = path.join(ROOT, ".data");
const CLONES = path.join(DATA, "wrapped-repos");
const CACHE = path.join(DATA, "wrapped-cache");
const ARGS = new Set(process.argv.slice(2));

for (const file of [".env.local", ".env"]) {
  if (existsSync(path.join(ROOT, file))) process.loadEnvFile(path.join(ROOT, file));
}

// ---------- tiempo (Uruguay es UTC-3 todo el año, sin horario de verano) ----------

const UY = -3 * 3600_000;
const HOUR = 3600_000;
const MIN = 60_000;
const uy = (ms: number) => new Date(ms + UY);
const hhmm = (ms: number) => uy(ms).toISOString().slice(11, 16);
const dayKey = (ms: number) => uy(ms).toISOString().slice(0, 10);
/** `fecha` (YYYY-MM-DD) a las `hora` en Uruguay, en ms UTC. */
const at = (fecha: string, hora: string) => Date.parse(`${fecha}T${hora}:00-03:00`);
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

const KICKOFF = Date.parse(process.env.KICKOFF ?? EVENT_KICKOFF_ISO);
const FREEZE = process.env.CIERRE
  ? /^\d{1,2}:\d{2}$/.test(process.env.CIERRE)
    ? at(dayKey(Date.parse(CODE_FREEZE_ISO)), process.env.CIERRE.padStart(5, "0"))
    : Date.parse(process.env.CIERRE)
  : Date.parse(CODE_FREEZE_ISO);
const VENUE_CLOSE = at(dayKey(KICKOFF), "21:00"); // la sede cierra: de acá en más, desde casa
const NIGHT_END = VENUE_CLOSE + 12 * HOUR; // 09:00 del día siguiente
const OWL_END = VENUE_CLOSE + 8 * HOUR; // 05:00: después de eso ya es madrugador
const LAST_MINUTE = 15;

// ---------- entrada ----------

type RepoEntry = { equipo: string; repo_url: string; finalista?: boolean };

async function readJson<T>(file: string, fallback?: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, "utf8")) as T;
  } catch (error) {
    if (fallback !== undefined && (error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw new Error(`no pude leer ${path.relative(ROOT, file)}: ${(error as Error).message}`);
  }
}

async function githubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  try {
    return (await run("gh", ["auth", "token"])).stdout.trim();
  } catch {
    return "";
  }
}

function parseRepo(url: string) {
  const m = url.trim().match(/github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i);
  return m ? { owner: m[1], name: m[2] } : null;
}

// ---------- git ----------

function gitEnv(token: string) {
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_LFS_SKIP_SMUDGE: "1" };
  if (token) {
    // credential helper que lee el token del entorno: sirve también para los
    // fetch perezosos del clon parcial (un extraHeader los rompe).
    Object.assign(env, {
      WRAPPED_GH_TOKEN: token,
      GIT_CONFIG_COUNT: "2",
      GIT_CONFIG_KEY_0: "credential.https://github.com.helper",
      GIT_CONFIG_VALUE_0: "",
      GIT_CONFIG_KEY_1: "credential.https://github.com.helper",
      GIT_CONFIG_VALUE_1: '!f() { echo username=x-access-token; echo "password=$WRAPPED_GH_TOKEN"; }; f',
    });
  }
  return env;
}

const git = (dir: string, args: string[], env: NodeJS.ProcessEnv) =>
  run("git", ["-C", dir, ...args], { env, maxBuffer: 512 * 1024 * 1024 }).then((r) => r.stdout);

/** Clona o actualiza. Si el fetch falla pero ya hay un clon, sigue con ese. */
async function syncRepo(entry: RepoEntry, env: NodeJS.ProcessEnv) {
  const slug = entry.repo_url.replace(/^.*github\.com[/:]/i, "").replace(/\.git$/, "").replace(/[^\w.-]+/g, "__");
  const dir = path.join(CLONES, slug);
  const url = entry.repo_url.trim().replace(/^git@github\.com:/i, "https://github.com/");
  if (!existsSync(path.join(dir, ".git"))) {
    if (ARGS.has("--offline")) throw new Error("sin clon local (--offline)");
    await mkdir(CLONES, { recursive: true });
    await run("git", ["clone", "--filter=blob:none", "--no-tags", "--quiet", url, dir], { env, maxBuffer: 64 * 1024 * 1024 });
    return { dir, stale: false };
  }
  if (ARGS.has("--offline")) return { dir, stale: true };
  try {
    await git(dir, ["fetch", "--all", "--prune", "--no-tags", "--quiet"], env);
    await git(dir, ["remote", "set-head", "origin", "--auto"], env).catch(() => {});
    await git(dir, ["reset", "--hard", "--quiet", "origin/HEAD"], env);
    return { dir, stale: false };
  } catch {
    return { dir, stale: true };
  }
}

type Commit = {
  hash: string;
  team: string;
  author: { name: string; email: string };
  time: number; // fecha de committer
  subject: string;
  added: number;
  deleted: number;
  files: string[];
  agents: string[];
  human: boolean;
};

// Archivos que no cuentan como "líneas escritas": dependencias, builds,
// lockfiles, datos y generados.
const IGNORED_PATH =
  /(^|\/)(node_modules|vendor|dist|build|out|\.next|\.nuxt|\.svelte-kit|\.vercel|\.turbo|coverage|venv|\.venv|env|__pycache__|\.expo|Pods|\.gradle|target)\/|(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|poetry\.lock|uv\.lock|Pipfile\.lock|Cargo\.lock|composer\.lock|Gemfile\.lock|go\.sum)$|\.(min\.(js|css)|map|lock|csv|tsv|jsonl|parquet|pkl|pt|onnx|ipynb|sqlite|db|log|snap)$|\.(generated|gen)\.\w+$/i;
const MAX_FILE_LINES = 10_000; // un archivo con más que esto en un commit es generado o datos

// Bots que no cuentan para nada.
const BOT = /\[bot\]|dependabot|github-actions|renovate|vercel|netlify|imgbot|codecov|snyk|semantic-release|allcontributors|pre-commit-ci|greenkeeper|mergify/i;
// Agentes de IA: en el autor o en trailers del mensaje.
const AGENTS: [string, RegExp][] = [
  ["claude", /\bclaude\b|anthropic\.com|claude\.ai/i],
  ["cursor", /\bcursor\b|cursoragent|cursor\.(com|sh)/i],
  ["copilot", /copilot/i],
  ["kiro", /\bkiro\b/i],
  ["codex", /\bcodex\b|chatgpt|openai\.com/i],
  ["gemini", /gemini|google-labs-jules|\bjules\b/i],
  ["devin", /\bdevin\b/i],
  ["windsurf", /windsurf|codeium/i],
  ["aider", /\baider\b/i],
  ["v0", /\bv0\b|v0\.(dev|app)/i],
  ["lovable", /lovable/i],
  ["bolt", /bolt\.new|stackblitz/i],
  ["replit", /replit/i],
  ["amp", /ampcode|\bamp\b/i],
  ["opencode", /opencode/i],
  ["cline", /\bcline\b|roo-?code/i],
];
const TRAILER = /^(co-authored-by|co-developed-by|assisted-by|generated-by|generated with|made with|🤖)/i;

function detectAgents(author: string, committer: string, body: string) {
  const lines = [author, committer, ...body.split("\n").filter((l) => TRAILER.test(l.trim()) || /generated (with|by)/i.test(l))];
  if (/^aider: /i.test(body)) lines.push("aider");
  return AGENTS.filter(([, re]) => lines.some((l) => re.test(l))).map(([name]) => name);
}

const SEP_REC = "\x1e";
const SEP_FIELD = "\x1f";
const SEP_END = "\x1d";

async function readCommits(dir: string, team: string, env: NodeJS.ProcessEnv): Promise<Commit[]> {
  const since = new Date(KICKOFF - 6 * HOUR).toISOString();
  // En un clon parcial, el primer `log --numstat` baja los blobs por tandas y a
  // veces una tanda falla; reintentar sigue desde lo que ya bajó.
  const logWithRetry = async (args: string[]) => {
    for (let attempt = 1; ; attempt++) {
      try {
        return await git(dir, args, env);
      } catch (error) {
        if (attempt >= 4) throw error;
      }
    }
  };
  const raw = await logWithRetry(
    [
      "log",
      "--all",
      "--no-merges",
      "--no-renames",
      "--numstat",
      `--since=${since}`,
      `--format=${SEP_REC}%H${SEP_FIELD}%an${SEP_FIELD}%ae${SEP_FIELD}%cn${SEP_FIELD}%ce${SEP_FIELD}%cI${SEP_FIELD}%B${SEP_END}`,
    ],
  );
  const commits: Commit[] = [];
  for (const record of raw.split(SEP_REC)) {
    if (!record.trim()) continue;
    const [head, stats = ""] = record.split(SEP_END);
    const [hash, an, ae, cn, ce, cdate, message = ""] = head.split(SEP_FIELD);
    const time = Date.parse(cdate);
    if (!(time >= KICKOFF && time <= FREEZE)) continue;
    const authorLine = `${an} <${ae}>`;
    const committerLine = `${cn} <${ce}>`;
    const agents = detectAgents(authorLine, committerLine, message);
    const authorIsAgent = AGENTS.some(([, re]) => re.test(authorLine)) || /noreply@anthropic|cursoragent/i.test(ae);
    if (BOT.test(authorLine) && !agents.length) continue;
    let added = 0;
    let deleted = 0;
    const files: string[] = [];
    for (const line of stats.split("\n")) {
      const [a, d, file] = line.split("\t");
      if (!file || a === "-" || IGNORED_PATH.test(file)) continue;
      const lines = Number(a) + Number(d);
      if (!Number.isFinite(lines) || lines > MAX_FILE_LINES) continue;
      added += Number(a);
      deleted += Number(d);
      files.push(file);
    }
    const subject = message.trim().split("\n")[0];
    commits.push({
      hash,
      team,
      author: { name: an, email: ae.toLowerCase() },
      time,
      subject: (subject ?? "").trim(),
      added,
      deleted,
      files,
      agents,
      human: !authorIsAgent && !BOT.test(authorLine),
    });
  }
  return commits;
}

// ---------- autores: unificar emails dentro de un equipo ----------

const normName = (s: string) => normalize(s).replace(/[^a-z0-9]+/g, " ").trim();

function unifyAuthors(commits: Commit[]) {
  const parent = new Map<string, string>();
  const find = (k: string): string => {
    const p = parent.get(k) ?? k;
    if (p === k) return k;
    const root = find(p);
    parent.set(k, root);
    return root;
  };
  const union = (a: string, b: string) => {
    if (!parent.has(a)) parent.set(a, a);
    if (!parent.has(b)) parent.set(b, b);
    parent.set(find(a), find(b));
  };
  for (const c of commits) {
    if (!c.human) continue;
    const e = `e:${c.author.email}`;
    union(e, `n:${normName(c.author.name)}`);
    const login = c.author.email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/)?.[1];
    if (login) union(e, `n:${normName(login)}`);
  }
  return (c: Commit) => find(`e:${c.author.email}`);
}

// ---------- archivos del repo: SDKs, modelos, frameworks ----------

const SKIP_DIR = /^(node_modules|\.git|\.next|dist|build|out|vendor|venv|\.venv|env|__pycache__|\.vercel|\.turbo|coverage|Pods|target|\.expo)$/;
const SOURCE = /\.(m?[jt]sx?|cjs|py|vue|svelte|astro|go|rs|rb|java|kt|swift|dart|php|cs|ipynb|ya?ml|toml|env\.example)$/i;

const PROVIDERS: [string, RegExp][] = [
  ["openai", /^(openai|@ai-sdk\/openai|@langchain\/openai|langchain-openai|llama-index-llms-openai|@azure\/openai)$/],
  ["anthropic", /^(@anthropic-ai\/sdk|@anthropic-ai\/claude-agent-sdk|@anthropic-ai\/claude-code|anthropic|claude-agent-sdk|@ai-sdk\/anthropic|@langchain\/anthropic|langchain-anthropic)$/],
  ["ai sdk", /^(ai|@ai-sdk\/.+)$/],
  ["langchain", /^(langchain|@langchain\/.+|langchain-.+|langgraph|@langchain\/langgraph)$/],
  ["llamaindex", /^(llamaindex|llama-index.*|llama_index.*)$/],
  ["gemini", /^(@google\/genai|@google\/generative-ai|google-genai|google-generativeai|@ai-sdk\/google|@langchain\/google-genai|langchain-google-genai|google\.genai|google\.generativeai)$/],
  ["groq", /^(groq-sdk|groq|@ai-sdk\/groq)$/],
  ["mistral", /^(@mistralai\/mistralai|mistralai|@ai-sdk\/mistral)$/],
  ["ollama", /^(ollama|ollama-ai-provider|@langchain\/ollama|langchain-ollama)$/],
  ["aws bedrock", /^(@aws-sdk\/client-bedrock.*|@ai-sdk\/amazon-bedrock|langchain-aws)$/],
  ["openrouter", /^(@openrouter\/.+|openrouter)$/],
  ["hugging face", /^(@huggingface\/.+|huggingface_hub|huggingface-hub|transformers)$/],
  ["elevenlabs", /^(elevenlabs|@elevenlabs\/.+|elevenlabs-js)$/],
  ["cohere", /^(cohere-ai|cohere|@ai-sdk\/cohere)$/],
  ["xai", /^(@ai-sdk\/xai|xai-sdk)$/],
  ["deepseek", /^(@ai-sdk\/deepseek|deepseek)$/],
  ["replicate", /^replicate$/],
  ["mcp", /^(@modelcontextprotocol\/sdk|mcp|fastmcp)$/],
  ["vercel ai gateway", /^@ai-sdk\/gateway$/],
];
const FRAMEWORKS: [string, RegExp][] = [
  ["next.js", /^next$/],
  ["react", /^react$/],
  ["vite", /^vite$/],
  ["tailwind", /^tailwindcss$/],
  ["shadcn/ui", /^(@radix-ui\/.+|shadcn)$/],
  ["supabase", /^(@supabase\/.+|supabase)$/],
  ["fastapi", /^fastapi$/],
  ["flask", /^flask$/i],
  ["django", /^django$/i],
  ["streamlit", /^streamlit$/],
  ["gradio", /^gradio$/],
  ["express", /^express$/],
  ["hono", /^hono$/],
  ["fastify", /^fastify$/],
  ["nestjs", /^@nestjs\/core$/],
  ["vue", /^vue$/],
  ["nuxt", /^nuxt$/],
  ["svelte", /^(svelte|@sveltejs\/kit)$/],
  ["astro", /^astro$/],
  ["expo", /^expo$/],
  ["react native", /^react-native$/],
  ["prisma", /^(prisma|@prisma\/client)$/],
  ["drizzle", /^drizzle-orm$/],
  ["convex", /^convex$/],
  ["firebase", /^(firebase|firebase-admin)$/],
  ["electron", /^electron$/],
  ["flutter", /^flutter$/],
];

function classify(names: Iterable<string>, table: [string, RegExp][]) {
  const out = new Set<string>();
  for (const raw of names) {
    const n = raw.trim().toLowerCase();
    for (const [label, re] of table) if (re.test(n)) out.add(label);
  }
  return out;
}

const MODEL_RE = /["'`](?:[\w.-]+\/)?((?:gpt-|chatgpt-|o[134](?:-mini|-pro)?["'`]|claude-|gemini-|llama|meta-llama|mistral-|mixtral|codestral|deepseek|qwen|grok-|kimi|gemma|phi-|command-r|sonar|whisper|dall-e|gpt-image|text-embedding|nomic|eleven_)[\w.:-]*)["'`]/gi;

function modelFamily(raw: string) {
  const m = raw.toLowerCase().replace(/["'`]/g, "").replace(/^meta-/, "");
  if (m.length > 40) return null;
  // sin sufijos de fecha ni versiones de despliegue: claude-sonnet-4-5-20250929 → claude-sonnet-4-5
  return m.replace(/[-@:](\d{6,8}|latest|preview(-\d+)?|exp(-\d+)?|\d{4}-\d{2}-\d{2})$/g, "").replace(/-v\d+(:\d+)?$/, "");
}

async function* walk(dir: string, depth = 0): AsyncGenerator<string> {
  if (depth > 8) return;
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isSymbolicLink()) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIR.test(e.name)) yield* walk(full, depth + 1);
    } else if (e.isFile()) yield full;
  }
}

async function scanTree(dir: string) {
  const packages = new Set<string>();
  const models = new Set<string>();
  const extensions = new Map<string, number>();
  let scanned = 0;
  for await (const file of walk(dir)) {
    if (scanned > 6000) break;
    const base = path.basename(file);
    const ext = path.extname(file).slice(1).toLowerCase();
    let size = 0;
    try {
      size = (await stat(file)).size;
    } catch {
      continue;
    }
    if (ext) extensions.set(ext, (extensions.get(ext) ?? 0) + size);
    if (size > 400_000) continue;
    const isManifest = /^(package\.json|requirements.*\.txt|pyproject\.toml|Pipfile|pubspec\.yaml)$/i.test(base);
    if (!isManifest && !SOURCE.test(base)) continue;
    scanned++;
    const text = await readFile(file, "utf8").catch(() => "");
    if (base === "package.json") {
      try {
        const pkg = JSON.parse(text);
        for (const k of ["dependencies", "devDependencies", "peerDependencies"]) Object.keys(pkg[k] ?? {}).forEach((d) => packages.add(d));
      } catch {
        // package.json roto: se ignora
      }
      continue;
    }
    if (/^requirements.*\.txt$/i.test(base)) {
      for (const line of text.split("\n")) {
        const name = line.trim().match(/^([A-Za-z0-9_.-]+)/)?.[1];
        if (name && !line.trim().startsWith("#")) packages.add(name.toLowerCase());
      }
      continue;
    }
    if (/^(pyproject\.toml|Pipfile|pubspec\.yaml)$/i.test(base)) {
      for (const m of text.matchAll(/^\s*["']?([A-Za-z0-9_.-]+)["']?\s*(?:[=<>~!^:\[]|$)/gm)) packages.add(m[1].toLowerCase());
      for (const m of text.matchAll(/["']([A-Za-z0-9_.-]+)\s*(?:\[[^\]]*\])?\s*[=<>~!]/g)) packages.add(m[1].toLowerCase());
      continue;
    }
    // imports JS/TS y Python
    for (const m of text.matchAll(/(?:from\s+|import\s*\(?\s*|require\s*\(\s*)["']((?:@[\w.-]+\/)?[\w.-]+)/g)) packages.add(m[1]);
    for (const m of text.matchAll(/^\s*(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/gm)) {
      const mod = (m[1] ?? m[2] ?? "").split(".");
      packages.add(mod[0]);
      if (mod.length > 1) packages.add(`${mod[0]}.${mod[1]}`);
    }
    for (const m of text.matchAll(MODEL_RE)) {
      const fam = modelFamily(m[1]);
      // un modelo de verdad tiene versión o tier ("claude-code-action" no)
      if (fam && fam.length >= 4 && /\d|opus|sonnet|haiku|flash|pro\b|mini|nano|turbo|chat|coder|instruct/.test(fam)) models.add(fam);
    }
  }
  return { packages, models, extensions };
}

// ---------- GitHub API: lenguajes y PRs ----------

async function gh<T>(token: string, url: string): Promise<T | null> {
  try {
    const res = await fetch(`https://api.github.com${url}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(15_000),
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function githubExtras(token: string, owner: string, name: string) {
  const languages = (await gh<Record<string, number>>(token, `/repos/${owner}/${name}/languages`)) ?? {};
  let prs = 0;
  for (let page = 1; page <= 5; page++) {
    const list = await gh<{ created_at: string }[]>(token, `/repos/${owner}/${name}/pulls?state=all&sort=created&direction=desc&per_page=100&page=${page}`);
    if (!list?.length) break;
    prs += list.filter((p) => {
      const t = Date.parse(p.created_at);
      return t >= KICKOFF && t <= FREEZE;
    }).length;
    if (list.length < 100 || Date.parse(list[list.length - 1].created_at) < KICKOFF) break;
  }
  return { languages, prs };
}

// ---------- mensajes ----------

const STOP = new Set(
  `de la el en y a los las del se que con por para un una al lo su es o como mas más pero sus le ya este esta esto ese eso son
  sin sobre entre cuando muy todo todos hay donde desde también tambien hasta otro otra ahora sí si no ni me mi te tu nos
  the and for to of in on with from at by is it as be this that an or are was not into via add added adds update updated
  updates`.split(/\s+/),
);
const CONVENTIONAL = /^(\w+)(\([^)]*\))?!?:\s*/;

const COUNTERS: [string, RegExp][] = [
  ["fix", /\bfix/i],
  ["wip", /\bwip\b/i],
  ["final", /\bfinal\b/i],
  ["ahora sí", /\bahora\s+s[ií]\b/i],
  ["por favor", /\bpor\s*fa(vor)?\b|\bplease\b|\bpl[iea]+s\b/i],
  ["funciona", /\bfunciona|\bworks?\b/i],
];
const EMOJI = /\p{Extended_Pictographic}|:[a-z_]+:/gu;

type Shown = { hash: string; team: string; text: string };

const FUNNY_HINTS = /ahora s[ií]|por ?fa|please|plis|jaj|jej|lol|!!|\?\?|ups|oops|magia|no s[eé]|rez[aá]|dios|ayuda|funciona|odio|perd[oó]n|sorry|final|otra vez|de nuevo|caf[eé]|mate|sue[nñ]o|dormir|\p{Extended_Pictographic}/iu;

async function pickFunny(candidates: Shown[]): Promise<Shown[]> {
  const pool = candidates.filter((c) => c.text.length >= 6 && c.text.length <= 110).slice(0, 1500);
  if (!pool.length) return [];
  const heuristic = () =>
    pool
      .map((c) => ({ c, score: (c.text.match(new RegExp(FUNNY_HINTS, "giu")) ?? []).length + (c.text.length < 60 ? 0.5 : 0) }))
      .filter((x) => x.score >= 1)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.c);
  if (!process.env.ANTHROPIC_API_KEY) return heuristic();

  const key = createHash("sha256").update(pool.map((c) => c.hash).join(",")).digest("hex").slice(0, 16);
  const cacheFile = path.join(CACHE, `funny-${key}.json`);
  const cached = await readJson<string[] | null>(cacheFile, null);
  let hashes = cached;
  if (!hashes) {
    try {
      const client = new Anthropic();
      const list = pool.map((c, i) => `${i}\t${c.text}`).join("\n");
      const res = await client.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 400,
        system:
          "Elegís mensajes de commit graciosos de una hackathon para mostrarlos en una pantalla gigante frente a participantes y sponsors. Celebrar, nunca humillar.",
        messages: [
          {
            role: "user",
            content: `Estos son mensajes de commit (índice<TAB>mensaje). Elegí los 8 más graciosos o simpáticos para el cierre del evento, del más al menos gracioso.

Descartá cualquiera que: tenga insultos, malas palabras o dobles sentidos; nombre o se burle de una persona; hable de política, religión, sexo, drogas o alcohol; pueda dejar mal a un equipo o a un sponsor; o sea gracioso solo con contexto interno. Ante la duda, descartalo.

Respondé solo con un array JSON de índices, por ejemplo [12, 4, 87].

${list}`,
          },
        ],
      });
      const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
      const idx = JSON.parse(text.match(/\[[\d,\s]*\]/)?.[0] ?? "[]") as number[];
      hashes = idx.map((i) => pool[i]?.hash).filter((h): h is string => Boolean(h));
      await mkdir(CACHE, { recursive: true });
      await writeFile(cacheFile, JSON.stringify(hashes));
    } catch (error) {
      console.warn(`  ! no pude elegir los graciosos con claude (${(error as Error).message}); uso la heurística`);
      return heuristic();
    }
  }
  const byHash = new Map(pool.map((c) => [c.hash, c]));
  return hashes.map((h) => byHash.get(h)).filter((c): c is Shown => Boolean(c));
}

// ---------- agregación ----------

const top = <T>(map: Map<string, T>, score: (v: T) => number, n: number) =>
  [...map.entries()].sort((a, b) => score(b[1]) - score(a[1]) || a[0].localeCompare(b[0])).slice(0, n);

function ranked(perTeam: Map<string, Set<string>>, n = 8): Ranked[] {
  const counts = new Map<string, number>();
  for (const set of perTeam.values()) for (const k of set) counts.set(k, (counts.get(k) ?? 0) + 1);
  return top(counts, (v) => v, n).map(([name, teams]) => ({ name, teams }));
}

async function main() {
  const reposFile = path.join(ROOT, "wrapped", "repos.json");
  if (!existsSync(reposFile)) {
    throw new Error("falta wrapped/repos.json — copiá wrapped/repos.example.json y completalo");
  }
  const repos = await readJson<RepoEntry[]>(reposFile);
  const hiddenRaw = await readJson<Partial<Hidden>>(path.join(ROOT, "wrapped", "hidden.json"), {});
  const hidden: Hidden = { commits: hiddenRaw.commits ?? [], words: hiddenRaw.words ?? [] };
  const token = await githubToken();
  const env = gitEnv(token);
  if (!token) console.warn("! sin GITHUB_TOKEN ni `gh auth token`: solo repos públicos y sin lenguajes/PRs");

  console.log(`build 101 wrapped · ${repos.length} repos · ventana ${new Date(KICKOFF).toISOString()} → ${new Date(FREEZE).toISOString()}`);

  type RepoResult = {
    entry: RepoEntry;
    commits: Commit[];
    scan: Awaited<ReturnType<typeof scanTree>>;
    extras: Awaited<ReturnType<typeof githubExtras>>;
  };
  const results: RepoResult[] = [];
  const queue = [...repos];
  const worker = async () => {
    for (let entry = queue.shift(); entry; entry = queue.shift()) {
      const started = Date.now();
      try {
        const { dir, stale } = await syncRepo(entry, env);
        const commits = await readCommits(dir, entry.equipo, env);
        const scan = await scanTree(dir);
        const parsed = parseRepo(entry.repo_url);
        const extras = parsed && !ARGS.has("--offline") ? await githubExtras(token, parsed.owner, parsed.name) : { languages: {}, prs: 0 };
        results.push({ entry, commits, scan, extras });
        console.log(`  ✓ ${entry.equipo} · ${commits.length} commits${stale ? " (clon viejo: falló el fetch)" : ""} · ${((Date.now() - started) / 1000).toFixed(1)}s`);
      } catch (error) {
        const detail = ((error as { stderr?: string }).stderr || (error as Error).message).trim().split("\n").pop();
        console.warn(`  ✗ ${entry.equipo}: ${detail?.replace(/(Basic|Bearer|x-access-token:)\s*[^@\s]+/gi, "$1 ***")}`);
      }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  if (!results.length) throw new Error("no pude leer ningún repo");

  const commits = results.flatMap((r) => r.commits).sort((a, b) => a.time - b.time);
  const teamOf = new Map(repos.map((r) => [r.equipo, r]));

  // personas: unificadas por equipo; sus nombres nunca salen en pantalla
  const names = new Set<string>();
  const people = new Map<string, Map<string, number>>(); // equipo → persona → commits
  for (const r of results) {
    const who = unifyAuthors(r.commits);
    const counts = new Map<string, number>();
    for (const c of r.commits) {
      if (!c.human) continue;
      counts.set(who(c), (counts.get(who(c)) ?? 0) + 1);
      for (const part of [...normName(c.author.name).split(" "), ...normName(c.author.email.split("@")[0]).split(" ")]) {
        if (part.length >= 3 && !STOP.has(part)) names.add(part);
      }
    }
    people.set(r.entry.equipo, counts);
  }

  const show = makeShowFilter(hidden, names);
  const shownMessage = (c: Commit) => show(c.hash, c.subject);

  // totales
  const files = new Set<string>();
  for (const c of commits) for (const f of c.files) files.add(`${c.team}\0${f}`);
  const totals = {
    commits: commits.length,
    linesAdded: commits.reduce((s, c) => s + c.added, 0),
    linesDeleted: commits.reduce((s, c) => s + c.deleted, 0),
    files: files.size,
    builders: [...people.values()].reduce((s, m) => s + m.size, 0),
    repos: results.length,
    teams: new Set(results.map((r) => r.entry.equipo)).size,
    prs: results.reduce((s, r) => s + r.extras.prs, 0),
  };

  // heatmap por hora, un renglón por día
  const days: WrappedMetrics["heatmap"]["days"] = [];
  for (let d = at(dayKey(KICKOFF), "00:00"); d <= FREEZE; d += 24 * HOUR) {
    const hours = Array.from({ length: 24 }, (_, h) => {
      const start = d + h * HOUR;
      return start + HOUR <= KICKOFF || start >= FREEZE ? null : 0;
    });
    days.push({ label: `${DIAS[uy(d).getUTCDay()]} ${uy(d).getUTCDate()}`, hours });
  }
  const dayStart = at(dayKey(KICKOFF), "00:00");
  let peak: WrappedMetrics["peak"] = null;
  for (const c of commits) {
    const i = Math.floor((c.time - dayStart) / (24 * HOUR));
    const h = uy(c.time).getUTCHours();
    const row = days[i]?.hours;
    if (row && row[h] !== null) row[h] = (row[h] ?? 0) + 1;
  }
  days.forEach((d) =>
    d.hours.forEach((n, hour) => {
      if (n && (!peak || n > peak.count)) peak = { day: d.label, hour, count: n };
    }),
  );
  const max = Math.max(0, ...days.flatMap((d) => d.hours.map((n) => n ?? 0)));

  // noche
  const night = commits.filter((c) => c.time >= VENUE_CLOSE && c.time < NIGHT_END);
  const owlCommit = [...night].filter((c) => c.time < OWL_END).pop();
  const owl = owlCommit
    ? { team: owlCommit.team, time: hhmm(owlCommit.time), message: shownMessage(owlCommit), afterHours: night.length }
    : null;
  const birdCommit = commits.find((c) => c.time >= OWL_END && dayKey(c.time) !== dayKey(KICKOFF));
  const earlyBird = birdCommit ? { team: birdCommit.team, time: hhmm(birdCommit.time), message: shownMessage(birdCommit) } : null;

  let sleepless: WrappedMetrics["sleepless"] = null;
  for (const team of teamOf.keys()) {
    const times = night.filter((c) => c.team === team).map((c) => c.time);
    if (times.length < 3) continue;
    const marks = [VENUE_CLOSE, ...times, Math.min(NIGHT_END, FREEZE)];
    const rest = Math.max(...marks.slice(1).map((t, i) => t - marks[i]));
    const restMin = Math.round(rest / MIN);
    if (!sleepless || restMin < sleepless.longestRestMin) sleepless = { team, longestRestMin: restMin, nightCommits: times.length };
  }

  let fastStart: WrappedMetrics["fastStart"] = null;
  for (const team of teamOf.keys()) {
    const first = commits.find((c) => c.team === team);
    if (!first) continue;
    const minutes = Math.round((first.time - KICKOFF) / MIN);
    if (!fastStart || minutes < fastStart.minutes) fastStart = { team, minutes };
  }

  const lastCommits = commits.filter((c) => c.time >= FREEZE - LAST_MINUTE * MIN);
  const lastMinute = { minutes: LAST_MINUTE, count: lastCommits.length, teams: new Set(lastCommits.map((c) => c.team)).size };

  // commits
  const monsterCommit = [...commits].sort((a, b) => b.added + b.deleted - (a.added + a.deleted))[0];
  const monster = monsterCommit
    ? {
        team: monsterCommit.team,
        lines: monsterCommit.added + monsterCommit.deleted,
        added: monsterCommit.added,
        deleted: monsterCommit.deleted,
        files: monsterCommit.files.length,
        message: shownMessage(monsterCommit),
      }
    : null;

  const wordCounts = new Map<string, number>();
  for (const c of commits) {
    const subject = c.subject.replace(CONVENTIONAL, "");
    if (!show(c.hash, subject)) continue;
    for (const raw of subject.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (raw.length < 3 || STOP.has(raw) || /^\d+$/.test(raw)) continue;
      if (!wordIsShowable(raw, hidden, names)) continue;
      wordCounts.set(raw, (wordCounts.get(raw) ?? 0) + 1);
    }
  }
  const words = top(wordCounts, (v) => v, 24).map(([word, count]) => ({ word, count }));

  const counters = COUNTERS.map(([label, re]) => ({ label, count: commits.filter((c) => re.test(c.subject)).length }));
  counters.push({ label: "emojis", count: commits.reduce((s, c) => s + (c.subject.match(EMOJI)?.length ?? 0), 0) });

  const shown: Shown[] = [];
  const seen = new Set<string>();
  for (const c of commits) {
    const text = shownMessage(c);
    if (text && !seen.has(text.toLowerCase())) {
      seen.add(text.toLowerCase());
      shown.push({ hash: c.hash, team: c.team, text });
    }
  }
  // solo el título: el cuerpo suele ser una lista autogenerada (squash, dependabot)
  const longestC = [...shown].sort((a, b) => b.text.length - a.text.length)[0];
  const shortestC = [...shown].sort((a, b) => a.text.length - b.text.length)[0];
  const longest = longestC ? { team: longestC.team, message: longestC.text, chars: longestC.text.length } : null;
  const shortest = shortestC ? { team: shortestC.team, message: shortestC.text, chars: shortestC.text.length } : null;
  const funny = (await pickFunny(shown))
    .filter((c) => show(c.hash, c.text))
    .slice(0, 5)
    .map((c) => ({ team: c.team, message: c.text }));

  // IA
  const agentCounts = new Map<string, number>();
  for (const c of commits) for (const a of c.agents) agentCounts.set(a, (agentCounts.get(a) ?? 0) + 1);
  const ai = {
    coauthored: commits.filter((c) => c.agents.length).length,
    total: commits.length,
    byAgent: top(agentCounts, (v) => v, 8).map(([agent, count]) => ({ agent, count })),
  };
  const providersByTeam = new Map<string, Set<string>>();
  const frameworksByTeam = new Map<string, Set<string>>();
  const modelsByTeam = new Map<string, Set<string>>();
  for (const r of results) {
    const add = (map: Map<string, Set<string>>, set: Set<string>) => {
      const prev = map.get(r.entry.equipo) ?? new Set<string>();
      set.forEach((v) => prev.add(v));
      map.set(r.entry.equipo, prev);
    };
    add(providersByTeam, classify(r.scan.packages, PROVIDERS));
    add(frameworksByTeam, classify(r.scan.packages, FRAMEWORKS));
    add(modelsByTeam, r.scan.models);
  }

  const langBytes = new Map<string, number>();
  for (const r of results) for (const [lang, bytes] of Object.entries(r.extras.languages)) langBytes.set(lang.toLowerCase(), (langBytes.get(lang.toLowerCase()) ?? 0) + bytes);
  const langTotal = [...langBytes.values()].reduce((s, v) => s + v, 0);
  const languages = langTotal
    ? (() => {
        const list = top(langBytes, (v) => v, 6).map(([name, bytes]) => ({ name, pct: Math.round((bytes / langTotal) * 1000) / 10 }));
        const rest = Math.round((100 - list.reduce((s, l) => s + l.pct, 0)) * 10) / 10;
        return rest >= 0.5 ? [...list, { name: "otros", pct: rest }] : list;
      })()
    : [];

  // equipos
  const teamCommits = new Map<string, number>();
  for (const c of commits) teamCommits.set(c.team, (teamCommits.get(c.team) ?? 0) + 1);
  const teams = top(teamCommits, (v) => v, 40).map(([team, n]) => ({ team, commits: n, finalista: Boolean(teamOf.get(team)?.finalista) }));

  let balanced: WrappedMetrics["balanced"] = null;
  let bestEvenness = -1;
  for (const [team, counts] of people) {
    const values = [...counts.values()].sort((a, b) => b - a);
    const sum = values.reduce((s, v) => s + v, 0);
    if (values.length < 2 || sum < 10) continue;
    // entropía normalizada × cobertura del equipo (3 personas reparten mejor que 2)
    const entropy = -values.reduce((s, v) => s + (v / sum) * Math.log(v / sum), 0) / Math.log(3);
    if (values[0] / sum <= 0.6 && entropy > bestEvenness) {
      bestEvenness = entropy;
      balanced = { team, commits: sum, shares: values.map((v) => Math.round((v / sum) * 100)) };
    }
  }

  const metrics: WrappedMetrics = {
    version: 1,
    generatedAt: new Date().toISOString(),
    window: { kickoff: new Date(KICKOFF).toISOString(), freeze: new Date(FREEZE).toISOString(), venueClose: "21:00" },
    totals,
    heatmap: { days, max },
    peak,
    owl,
    earlyBird,
    lastMinute,
    sleepless,
    fastStart,
    monster,
    words,
    counters,
    longest,
    shortest,
    funny,
    ai,
    providers: ranked(providersByTeam),
    models: ranked(modelsByTeam),
    languages,
    frameworks: ranked(frameworksByTeam),
    teams,
    balanced,
  };

  const json = JSON.stringify(metrics);
  await mkdir(DATA, { recursive: true });
  const tmp = `${WRAPPED_LOCAL_FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(metrics, null, 2));
  await rename(tmp, WRAPPED_LOCAL_FILE);
  console.log(`\n→ ${path.relative(ROOT, WRAPPED_LOCAL_FILE)} · ${totals.commits} commits · ${totals.builders} builders · ${ai.coauthored} con IA`);

  if (ARGS.has("--no-publish")) return;
  if (!redisConfiguration()) {
    console.log("  (sin INVESTMENTS_REDIS_REST_URL/TOKEN: no se publicó; la tele muestra el último publicado)");
    return;
  }
  await redis(["SET", WRAPPED_KEY, json]);
  console.log("→ publicado: /wrapped lo toma en la próxima vuelta del loop");
}

main().catch((error) => {
  console.error(`✗ ${(error as Error).message}`);
  process.exit(1);
});
