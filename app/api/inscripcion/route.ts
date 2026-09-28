import { APPLY_OPEN } from "@/app/event";
import { normalize, validate, type AntiSpam, type Application } from "@/lib/inscripcion";

// POST /api/inscripcion — recibe la postulación, la valida y la agrega como
// fila en la Google Sheet "build 101 · Postulaciones" a través de un web app de
// Apps Script (ver scripts/google-apps-script/). La URL y el secreto viven en
// variables de entorno: nunca llegan al navegador.
//
//   GOOGLE_SHEETS_WEBHOOK_URL     https://script.google.com/macros/s/…/exec
//   GOOGLE_SHEETS_WEBHOOK_SECRET  el mismo valor que SHARED_SECRET en el script

type Result = { ok: true } | { ok: false; error: string; fields?: Record<string, string> };

const json = (body: Result, status = 200) => Response.json(body, { status });

// Límite simple por IP: 5 envíos cada 10 minutos. Vive en memoria de cada
// instancia, así que es un freno para abusos, no una garantía.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** Fila plana para la sheet: una fila por postulación, hasta 3 integrantes. */
function toRow(app: Application, id: string) {
  const row: Record<string, string> = {
    fecha: new Date().toLocaleString("sv-SE", { timeZone: "America/Montevideo" }),
    id,
    tipo: app.mode === "team" ? "equipo" : "busca equipo",
    estado: "pendiente",
    nombre_equipo: app.teamName,
    comentarios: app.comments,
  };
  app.members.forEach((m, i) => {
    const p = `p${i + 1}_`;
    row[`${p}nombre`] = m.firstName;
    row[`${p}apellido`] = m.lastName;
    row[`${p}celular`] = m.phone;
    row[`${p}mail`] = m.email;
    row[`${p}ia`] = m.aiTools;
  });
  return row;
}

export async function POST(request: Request) {
  if (!APPLY_OPEN) {
    return json({ ok: false, error: "Las inscripciones todavía no están abiertas." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "No pudimos leer el formulario." }, 400);
  }

  // Anti-spam: si el honeypot viene completo o el formulario se envió en menos
  // de 3 segundos, respondemos "ok" sin guardar nada (no le avisamos al bot).
  const spam = (body ?? {}) as AntiSpam;
  if (spam.website || (spam.startedAt && Date.now() - spam.startedAt < 3000)) {
    return json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return json(
      { ok: false, error: "Recibimos muchos envíos seguidos. Esperá unos minutos y probá de nuevo." },
      429,
    );
  }

  const app = normalize(body);
  if (!app) return json({ ok: false, error: "El formulario llegó incompleto." }, 400);

  const fields = validate(app);
  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: "Revisá los campos marcados.", fields }, 422);
  }

  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;
  if (!url || !secret) {
    console.error("[inscripcion] faltan GOOGLE_SHEETS_WEBHOOK_URL / GOOGLE_SHEETS_WEBHOOK_SECRET");
    return json({ ok: false, error: "No pudimos guardar tu postulación." }, 503);
  }

  const id = crypto.randomUUID().slice(0, 8);
  try {
    // Apps Script responde con un redirect 302 a googleusercontent.com; fetch
    // lo sigue como GET y ahí está la respuesta JSON del script.
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, row: toRow(app, id) }),
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!res.ok || !data?.ok) {
      console.error("[inscripcion] la sheet rechazó el envío", res.status, data?.error);
      return json({ ok: false, error: "No pudimos guardar tu postulación." }, 502);
    }
  } catch (err) {
    console.error("[inscripcion] error llamando a la sheet", err);
    return json({ ok: false, error: "No pudimos guardar tu postulación." }, 502);
  }

  return json({ ok: true });
}
