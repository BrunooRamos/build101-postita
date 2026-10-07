import Anthropic from "@anthropic-ai/sdk";
import { PARTICIPANTS_EMAIL } from "@/app/event";
import { GET as llmsTxt } from "@/app/llms.txt/route";

// /api/ask — el comando `ask` de la terminal del hero. Responde preguntas
// sobre build 101 con Claude usando como única fuente /llms.txt (que sale de
// event.ts + faqs.tsx + sponsors.ts), así que nunca dice algo distinto de lo que muestra la
// página. La respuesta llega en streaming como texto plano.
//
//   ANTHROPIC_API_KEY  clave de la API de Anthropic (solo server-side)
//
// Sin clave, GET responde { enabled: false } y la terminal no ofrece el
// comando; si algo falla, POST responde 503 y la terminal imprime
// "ask: sin conexión".

const MODEL = "claude-opus-5-5";
const MAX_QUESTION = 300;

// 10 preguntas por IP por hora. En memoria de cada instancia: frena abusos,
// no es una garantía (mismo criterio que /api/inscripcion).
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 10;
const hits = new Map<string, number[]>();

function rateLimited(key: string) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > MAX_PER_IP;
}

const enabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

// El system prompt no cambia entre requests (se cachea en la API).
let system: Promise<string> | null = null;
const getSystem = () =>
  (system ??= llmsTxt()
    .text()
    .then(
      (facts) => `Sos la terminal de build 101. Respondés preguntas sobre el evento usando únicamente la información de <info>.

- Escribí en minúsculas, en español rioplatense (voseo), en 60 palabras o menos. Texto plano: sin markdown, sin listas, sin emojis.
- Si la respuesta no está en <info>, respondé exactamente "eso no lo sé. escribile a ${PARTICIPANTS_EMAIL}" y nada más.
- Nunca prometas un lugar: la participación depende de la selección y confirmación del equipo organizador.
- No inventes fechas, premios, mentores, jurado ni la consigna. Lo que no está en <info> todavía no se anunció.
- Si te piden algo que no tiene que ver con build 101 (escribir código, tareas, otros temas), decí que solo respondés sobre build 101.

<info>
${facts}
</info>`,
    ));

const text = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });

export function GET() {
  return Response.json(
    { enabled: enabled() },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
}

export async function POST(request: Request) {
  if (!enabled()) return text("ask: sin conexión", 503);

  let question = "";
  try {
    const body = (await request.json()) as { q?: unknown };
    question = typeof body.q === "string" ? body.q.trim() : "";
  } catch {
    return text("ask: no pude leer la pregunta", 400);
  }
  if (question.length < 2) return text("ask: escribí una pregunta, por ejemplo ask ¿tiene costo?", 400);
  if (question.length > MAX_QUESTION) return text("ask: la pregunta es muy larga", 400);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(`ip:${ip}`)) return text("ask: muchas preguntas seguidas. probá en un rato", 429);

  let events: AsyncIterator<Anthropic.Beta.Messages.BetaRawMessageStreamEvent>;
  let first: IteratorResult<Anthropic.Beta.Messages.BetaRawMessageStreamEvent>;
  try {
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      // respuestas cortas; el margen es para el pensamiento adaptativo
      max_tokens: 1024,
      output_config: { effort: "low" },
      // si los clasificadores de seguridad rechazan la pregunta, la API la
      // reintenta sola con el modelo de respaldo recomendado
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      cache_control: { type: "ephemeral" },
      system: await getSystem(),
      messages: [{ role: "user", content: question }],
    });
    events = stream[Symbol.asyncIterator]();
    // esperamos el primer evento: los errores de auth o de límite llegan acá
    // y todavía podemos responder 503 en vez de un stream vacío
    first = await events.next();
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`/api/ask: API error ${error.status}`, error.message);
    } else {
      console.error("/api/ask:", error);
    }
    return text("ask: sin conexión", 503);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let wrote = false;
      let refused = false;
      try {
        for (let r = first; !r.done; r = await events.next()) {
          const event = r.value;
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            wrote = true;
            controller.enqueue(encoder.encode(event.delta.text));
          } else if (event.type === "message_delta" && event.delta.stop_reason === "refusal") {
            refused = true;
          }
        }
        if (refused || !wrote) {
          controller.enqueue(
            encoder.encode(`${wrote ? "\n" : ""}eso no lo sé. escribile a ${PARTICIPANTS_EMAIL}`),
          );
        }
      } catch (error) {
        console.error("/api/ask stream:", error);
        controller.enqueue(encoder.encode(`${wrote ? "\n" : ""}ask: se cortó la conexión`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
