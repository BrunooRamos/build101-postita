import type { ReactNode } from "react";
import {
  APPLY_OPEN,
  LUMA_URL,
  VENUE,
  VENUE_ADDRESS,
  VENUE_MAPS,
  CONTACT_EMAIL,
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

export const FAQS: FaqItem[] = [
  {
    q: "¿qué es build 101?",
    aText:
      "una hackathon de 36 horas donde equipos construyen un producto real y funcional en un solo fin de semana. 17 y 18 de octubre de 2026 en montevideo.",
  },
  {
    q: "¿quién puede participar?",
    aText:
      "jóvenes builders de uruguay: estudiantes y jóvenes profesionales de desarrollo, diseño y producto. no necesitás haber participado antes en una hackathon.",
  },
  {
    q: "¿de qué parte de uruguay puede ser mi equipo?",
    aText:
      "de cualquier parte del país: build 101 es abierta a equipos de todo uruguay. la sede es en montevideo y la hackathon es presencial, así que tu equipo tiene que poder estar acá el 17 y 18 de octubre.",
  },
  {
    q: "¿cuánto cuesta?",
    aText:
      "participar es gratis. los cupos son limitados y la postulación está sujeta a selección por parte del equipo organizador.",
  },
  APPLY_OPEN
    ? {
        q: "¿cómo me inscribo y cómo es la selección?",
        aText:
          "la inscripción es a través de luma (luma.com/2kxg61n8). postulás a tu equipo y te confirmamos si quedaron seleccionados, junto con los próximos pasos.",
        a: (
          <>
            la inscripción es a través de{" "}
            <a href={LUMA_URL} target="_blank" rel="noopener noreferrer" className="bracket">
              luma
            </a>
            . postulás a tu equipo y te confirmamos si quedaron seleccionados, junto con
            los próximos pasos.
          </>
        ),
      }
    : {
        q: "¿cuándo abren las inscripciones?",
        aText: `las inscripciones todavía no están abiertas: pronto anunciamos la fecha de apertura y el link para postular. va a ser por equipos de 3 personas y con selección del equipo organizador. si querés que te avisemos, escribinos a ${CONTACT_EMAIL}.`,
        a: (
          <>
            las inscripciones todavía no están abiertas: pronto anunciamos la fecha de
            apertura y el link para postular. va a ser por equipos de 3 personas y con
            selección del equipo organizador. si querés que te avisemos, escribinos a{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="bracket">
              {CONTACT_EMAIL}
            </a>
            .
          </>
        ),
      },
  {
    q: "¿necesito tener un equipo para aplicar?",
    aText:
      "sí: se postula por equipos de 3 personas. si todavía no tenés equipo, escribinos y te ayudamos a formar uno.",
  },
  {
    q: "¿necesito saber programar?",
    aText:
      "buscamos perfiles diversos, pero al menos parte del equipo debería poder construir el producto. diseño y producto suman muchísimo, pero el objetivo es shippear algo que funcione.",
  },
  {
    q: "¿qué puedo construir?",
    aText:
      "la consigna se revela en el kickoff, para que nadie llegue con ventaja. podés llegar con ideas, pero el producto se define y se construye ahí.",
  },
  {
    q: "¿cuál es la consigna?",
    aText:
      "la consigna específica se anuncia más adelante. todos los equipos construyen sobre la misma consigna y compiten por el premio principal.",
  },
  {
    q: "¿puedo empezar a trabajar antes del evento?",
    aText:
      "no. se construye durante las 36 horas del evento, y eso es lo que se evalúa. podés llegar con ideas, pero el código se escribe ahí.",
  },
  {
    q: "¿de quién es lo que construyo?",
    aText:
      "el proyecto es 100% tuyo y de tu equipo. conservás la propiedad intelectual de lo que crees.",
  },
  {
    q: "¿qué tengo que llevar?",
    aText:
      "tu notebook, cargador y documento. el espacio, la conexión, la comida y el café los ponemos nosotros.",
  },
  {
    q: "¿hay comida? ¿se descansa en la sede?",
    aText:
      "todas las comidas están cubiertas, con café durante todo el evento. en la sede no se duerme: abre el sábado de 08:00 a 22:00 y el domingo de 08:00 a 20:00. el cronograma detallado se publica antes del evento.",
  },
  {
    q: "¿dónde es?",
    aText: `en la ${VENUE}, ${VENUE_ADDRESS}, uruguay.`,
    a: (
      <>
        en la {VENUE}, {VENUE_ADDRESS}.{" "}
        <a href={VENUE_MAPS} target="_blank" rel="noopener noreferrer" className="bracket">
          ver en el mapa
        </a>
        .
      </>
    ),
  },
  {
    q: "¿tenés otra pregunta?",
    aText: `escribinos a ${CONTACT_EMAIL} y te respondemos.`,
    a: (
      <>
        escribinos a{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="bracket">
          {CONTACT_EMAIL}
        </a>{" "}
        y te respondemos.
      </>
    ),
  },
];
