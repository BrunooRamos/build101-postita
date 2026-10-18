import sample from "@/wrapped/metrics.sample.json";
import { readPublishedMetrics } from "@/lib/wrapped-store";

// GET /api/wrapped — el metrics.json que lee la tele. Si el store falla responde
// 503 y la página sigue mostrando los últimos datos buenos.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" };

export async function GET() {
  try {
    const published = await readPublishedMetrics();
    return new Response(published ?? JSON.stringify(sample), { headers });
  } catch {
    return Response.json({ error: "metrics unavailable" }, { status: 503, headers });
  }
}
