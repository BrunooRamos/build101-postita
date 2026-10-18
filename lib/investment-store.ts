import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoPortfolios, INVESTMENT_GAME, summarizePortfolios, validatePortfolio, type Portfolio, type GameSnapshot } from "./investment-game";

const KEY = `build101:investments:${INVESTMENT_GAME.roundId}`;
const dataFile = path.join(process.cwd(), ".data", `${INVESTMENT_GAME.roundId}.json`);
let writeQueue: Promise<unknown> = Promise.resolve();

function redisConfiguration() {
  const credentials = [
    [process.env.INVESTMENTS_REDIS_REST_URL, process.env.INVESTMENTS_REDIS_REST_TOKEN],
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ].find(([url, token]) => url && token);
  return credentials ? { url: credentials[0]!, token: credentials[1]! } : null;
}

function redisConfigured() {
  return Boolean(redisConfiguration());
}

async function redis(command: string[]) {
  const config = redisConfiguration();
  if (!config) throw new Error("Investment store is not configured");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Investment store unavailable");
  const data = await response.json() as { result?: unknown; error?: string };
  if (data.error) throw new Error("Investment store rejected command");
  return data.result;
}

async function readPortfolios(): Promise<Portfolio[]> {
  let saved: Portfolio[] = [];
  if (redisConfigured()) {
    const raw = await redis(["HGETALL", KEY]) as string[];
    saved = raw.filter((_, i) => i % 2 === 1).map((value) => JSON.parse(value) as Portfolio);
  } else if (!process.env.VERCEL) {
    try {
      saved = JSON.parse(await readFile(dataFile, "utf8")) as Portfolio[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const combined = new Map(demoPortfolios().map((portfolio) => [portfolio.investorId, portfolio]));
  // Revalidate persisted records against the current roster and rules.
  for (const portfolio of saved) {
    const valid = validatePortfolio(portfolio);
    if (valid.portfolio) combined.set(portfolio.investorId, { ...valid.portfolio, updatedAt: portfolio.updatedAt });
  }
  return [...combined.values()];
}

export async function gameSnapshot(investorId?: string | null): Promise<GameSnapshot> {
  const portfolios = await readPortfolios();
  return {
    results: summarizePortfolios(portfolios),
    portfolio: portfolios.find((portfolio) => portfolio.investorId === investorId) ?? null,
    storage: redisConfigured() ? "shared" : process.env.VERCEL ? "preview" : "local",
    updatedAt: new Date().toISOString(),
  };
}

export async function savePortfolio(portfolio: Portfolio) {
  if (redisConfigured()) {
    // A single atomic write per voter: edits replace rather than add votes.
    await redis(["HSET", KEY, portfolio.investorId, JSON.stringify(portfolio)]);
    return;
  }
  if (process.env.VERCEL) throw new Error("Configure shared investment storage before accepting votes");
  const operation = writeQueue.catch(() => {}).then(async () => {
    const portfolios = await readPortfolios();
    const updated = portfolios.filter((previous) => previous.investorId !== portfolio.investorId);
    updated.push(portfolio);
    await mkdir(path.dirname(dataFile), { recursive: true });
    const temporary = `${dataFile}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(updated), "utf8");
    await rename(temporary, dataFile);
  });
  writeQueue = operation;
  await operation;
}
