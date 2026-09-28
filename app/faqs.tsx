import type { ReactNode } from "react";
import {
  APPLY_DEADLINE,
  APPLY_OPEN,
  APPLY_PATH,
  MENTORS_EMAIL,
  PARTICIPANTS_EMAIL,
  SCHEDULE,
  SPONSORS_EMAIL,
  VENUE,
  VENUE_ADDRESS,
  VENUE_MAPS,
} from "./event";

/**
 * FAQs — fuente única de verdad.
 * `aText` (texto plano) alimenta el JSON-LD FAQPage y /llms.txt; `a` (JSX)
 * es la versión con links que se muestra en la página. Si editás una,
 * editá la otra: el schema debe decir lo mismo que se ve en pantalla.
 */
export type FaqItem = {
  q: string;
  /** Respuesta en texto plano (schema.org / llms.txt). */
  aText: string;
  /** Respuesta con markup para la página. Si falta, se usa aText. */
  a?: ReactNode;
};

const hours = SCHEDULE.map((d) => `el ${d.day} de ${d.hours}`).join(" y ");

export const FAQS: FaqItem[] = [
  {
    q: "¿qué es build 101?",
    aText:
      "la hackathon de ia más grande de uruguay: un fin de semana presencial en montevideo para construir un producto de inteligencia artificial y pitchearlo en vivo frente a un jurado. 17 y 18 de octubre de 2026.",
  },
  {
    q: "¿inscribirme confirma mi lugar?",
    aText:
      "no. la inscripción nos permite conocerte. la participación queda sujeta a selección y confirmación explícita del equipo organizador, y te escribimos por mail cuando termine la selección.",
  },
  {
    q: "¿puedo anotarme sin un equipo completo?",
    aText:
      "sí. los equipos son de 3 personas: si ya lo tienen, inscriben al equipo completo; si no, te inscribís solo y te ayudamos a encontrar con quién construir.",
  },
  {
    q: "¿hasta cuándo me puedo inscribir?",
    aText: APPLY_OPEN
      ? `hasta el ${APPLY_DEADLINE}. los cupos son limitados.`
      : "las inscripciones todavía no están abiertas: pronto anunciamos la fecha de apertura.",
    a: APPLY_OPEN ? (
      <>
        hasta el {APPLY_DEADLINE}. los cupos son limitados:{" "}
        <a href={APPLY_PATH} className="bracket">
          inscribite acá
        </a>
        .
      </>
    ) : undefined,
  },
  {
    q: "¿tiene costo?",
    aText: "no, participar es gratis. los cupos son limitados.",
  },
  {
    q: "¿se puede pasar la noche en la facultad?",
    aText: `no. la sede abre ${hours}, y de noche está cerrada.`,
  },
  {
    q: "¿qué tengo que llevar?",
    aText:
      "tu notebook, cargador y documento. el espacio, la conexión, la comida y el café los ponemos nosotros.",
  },
  {
    q: "¿qué puedo construir y cómo se evalúa?",
    aText:
      "un producto de inteligencia artificial: no alcanza con usar ia para construir. la consigna se revela en el kickoff para que nadie llegue con ventaja, y se evalúa el producto funcionando y el pitch en vivo frente al jurado. lo que construyas es 100% de tu equipo.",
  },
  {
    q: "¿dónde es?",
    aText: `en la ${VENUE}, ${VENUE_ADDRESS}, uruguay. es presencial.`,
    a: (
      <>
        en la {VENUE}, {VENUE_ADDRESS}. es presencial.{" "}
        <a href={VENUE_MAPS} target="_blank" rel="noopener noreferrer" className="bracket">
          ver en el mapa
        </a>
        .
      </>
    ),
  },
  {
    q: "¿a quién le escribo si tengo otra pregunta?",
    aText: `inscripción y participantes: ${PARTICIPANTS_EMAIL}. mentores: ${MENTORS_EMAIL}. sponsors: ${SPONSORS_EMAIL}.`,
    a: (
      <>
        inscripción y participantes:{" "}
        <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="bracket">
          {PARTICIPANTS_EMAIL}
        </a>
        . mentores:{" "}
        <a href={`mailto:${MENTORS_EMAIL}`} className="bracket">
          {MENTORS_EMAIL}
        </a>
        . sponsors:{" "}
        <a href={`mailto:${SPONSORS_EMAIL}`} className="bracket">
          {SPONSORS_EMAIL}
        </a>
        .
      </>
    ),
  },
];
