import snapshot from "@/wrapped/metrics.json";
import { readPublishedMetrics } from "@/lib/wrapped-store";

// GET /api/wrapped — el metrics.json que leen las tarjetas. Si el store falla responde
// 503 y la página ofrece reintentar.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const published = await readPublishedMetrics();
    return new Response(published ?? JSON.stringify(snapshot), { headers });
  } catch {
    return Response.json({ error: "metrics unavailable" }, { status: 503, headers });
  }
}
