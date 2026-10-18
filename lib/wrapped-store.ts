import { readFile } from "node:fs/promises";
import path from "node:path";

// build 101 wrapped: dónde vive metrics.json.
// - Publicado: una key en el mismo Redis REST (Upstash) que usa la ronda de
//   inversión. El script la pisa en cada corrida, así la tele se actualiza sin
//   redeploy.
// - Snapshot: `wrapped/metrics.json`, que escribe el script con datos reales
//   de git y se commitea; es lo que se ve si el store no tiene nada.
// No hay datos de ejemplo: lo que sale en la tele es siempre real.

export const WRAPPED_KEY = "build101:wrapped:metrics";
export const WRAPPED_LOCAL_FILE = path.join(process.cwd(), "wrapped", "metrics.json");

export function redisConfiguration() {
  const credentials = [
    [process.env.INVESTMENTS_REDIS_REST_URL, process.env.INVESTMENTS_REDIS_REST_TOKEN],
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ].find(([url, token]) => url && token);
  return credentials ? { url: credentials[0]!, token: credentials[1]! } : null;
}

export async function redis(command: string[]) {
  const config = redisConfiguration();
  if (!config) throw new Error("wrapped store is not configured");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`wrapped store unavailable (${response.status})`);
  const data = (await response.json()) as { result?: unknown; error?: string };
  if (data.error) throw new Error("wrapped store rejected command");
  return data.result;
}

/** El último metrics.json publicado, o null si todavía no hay ninguno. */
export async function readPublishedMetrics(): Promise<string | null> {
  if (redisConfiguration()) {
    const raw = await redis(["GET", WRAPPED_KEY]);
    if (typeof raw === "string" && raw) return raw;
  }
  if (!process.env.VERCEL) {
    try {
      return await readFile(WRAPPED_LOCAL_FILE, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return null;
}
