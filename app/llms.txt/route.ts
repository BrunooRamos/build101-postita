import {
  APPLY_DEADLINE,
  APPLY_OPEN,
  CANONICAL_URL,
  EVENT_DATES_LONG,
  EVENT_DESCRIPTION,
  APPLY_URL,
  SCHEDULE,
  SOCIALS,
  TEAM_EMAILS,
  TEAM_SIZE,
  VENUE,
  VENUE_ADDRESS,
} from "../event";
import { FAQS } from "../faqs";

// /llms.txt — resumen del sitio en markdown para answer engines y crawlers de
// LLMs (convención emergente, https://llmstxt.org). Se genera en build desde
// event.ts + faqs.tsx: nunca puede divergir del contenido visible.
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
- equipos: ${TEAM_SIZE} personas; podés inscribir a tu equipo o inscribirte solo y te ayudamos a formar uno.
- horario: ${SCHEDULE.map((d) => `${d.day} de ${d.hours}`).join(" y ")}; no se duerme en la sede.
${
    APPLY_OPEN
      ? `- cierre de inscripción: ${APPLY_DEADLINE} (hora de uruguay).
- inscripción: ${APPLY_URL}`
      : `- inscripción: todavía no está abierta. la apertura y el link para postular se anuncian próximamente en ${CANONICAL_URL}`
  }
- sitio oficial: ${CANONICAL_URL}
- contacto: ${TEAM_EMAILS.join(" · ")}
- redes: ${SOCIALS.map((s) => `${s.label.toLowerCase()} ${s.url}`).join(" · ")}

## preguntas frecuentes

${FAQS.map((f) => `### ${f.q}\n\n${f.aText}`).join("\n\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
