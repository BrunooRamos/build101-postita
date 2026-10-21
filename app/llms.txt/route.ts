import {
  APPLY_CLOSED_MESSAGE,
  APPLY_DEADLINE_FULL,
  APPLY_OPEN,
  CANONICAL_URL,
  EVENT_DATES_LONG,
  EVENT_DESCRIPTION,
  JURY,
  MENTORS_DESCRIPTION,
  APPLY_URL,
  SCHEDULE,
  SOCIALS,
  TEAM_EMAILS,
  TEAM_SIZE,
  VENUE,
  VENUE_ADDRESS,
} from "../event";
import { FAQS } from "../faqs";
import { TIERS } from "../sponsors";
import { PRESS, formatPressDate } from "../press";

// /llms.txt — resumen del sitio en markdown para answer engines y crawlers de
// LLMs (convención emergente, https://llmstxt.org). Se genera en build desde
// event.ts + faqs.tsx + sponsors.ts: nunca puede divergir del contenido visible.
export const dynamic = "force-static";

export function GET() {
  const body = `# build 101

> ${EVENT_DESCRIPTION}

## datos clave

- qué: la hackathon de IA más grande de uruguay, presencial: se construye un producto de IA durante el fin de semana y se pitchea en vivo frente a un jurado.
- alcance: abierta a equipos de todo uruguay; la sede es en montevideo.
- cuándo: ${EVENT_DATES_LONG}.
- dónde: ${VENUE}, ${VENUE_ADDRESS}, uruguay.
- precio: gratis, con cupos limitados y selección del equipo organizador.
- equipos: ${TEAM_SIZE} personas; ${APPLY_OPEN ? "podés inscribir a tu equipo o inscribirte solo y te ayudamos a formar uno." : "si te inscribiste solo, te ayudamos a formar uno."}
- horario: ${SCHEDULE.map((d) => `${d.day} de ${d.hours}`).join(" y ")}; no se duerme en la sede.
${
    APPLY_OPEN
      ? `- cierre de inscripción: ${APPLY_DEADLINE_FULL} (hora de uruguay).
- inscripción: ${APPLY_URL}`
      : `- inscripción: ${APPLY_CLOSED_MESSAGE}`
  }
- sitio oficial: ${CANONICAL_URL}
- contacto: ${TEAM_EMAILS.join(" · ")}
- redes: ${SOCIALS.map((s) => `${s.label.toLowerCase()} ${s.url}`).join(" · ")}

## organizan

- build 101 (${CANONICAL_URL})
- Universidad de Montevideo · Facultad de Ingeniería (FIUM) (https://um.edu.uy)
- MÜTÜÖ (https://canalmutuo.com)

## mentores

${MENTORS_DESCRIPTION}

## jurado

${JURY.map((j) => `- ${j.name}: ${j.role}${j.note ? ` · ${j.note}` : ""}`).join("\n")}

## prensa

${PRESS.map((p) => `- ${p.outlet} (${formatPressDate(p.date)}): "${p.title}" ${p.url}`).join("\n")}
- todas las notas: ${CANONICAL_URL}prensa

## sponsors

${TIERS.map(
    (t) =>
      `### ${t.label}\n\n${t.items.map((s) => `- ${s.name}${s.url ? ` (${s.url})` : ""}`).join("\n")}`,
  ).join("\n\n")}

## preguntas frecuentes

${FAQS.map((f) => `### ${f.q}\n\n${f.aText}`).join("\n\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
