import { INVESTMENT_GAME, validatePortfolio } from "@/lib/investment-game";
import { gameSnapshot, savePortfolio } from "@/lib/investment-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  try {
    return json(await gameSnapshot(new URL(request.url).searchParams.get("investorId")));
  } catch {
    return json({ error: "No pudimos cargar la ronda. Volvé a intentar." }, 503);
  }
}

export async function POST(request: Request) {
  if (!INVESTMENT_GAME.open) return json({ error: "La ronda de inversión está cerrada." }, 403);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "Origen no permitido." }, 403);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 8192) return json({ error: "La cartera es demasiado grande." }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "No pudimos leer la cartera." }, 400);
  }
  const valid = validatePortfolio(body);
  if (!valid.portfolio) return json({ error: valid.error }, 422);
  try {
    await savePortfolio(valid.portfolio);
    return json(await gameSnapshot(valid.portfolio.investorId));
  } catch {
    return json({ error: "No pudimos guardar tu inversión. Tu cartera sigue acá; probá otra vez." }, 503);
  }
}
