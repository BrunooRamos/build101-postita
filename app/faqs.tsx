import type { ReactNode } from "react";
import Link from "next/link";
import { CANONICAL_URL, MENTORS_EMAIL, PARTICIPANTS_EMAIL, SPONSORS_EMAIL, VENUE } from "./event";

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
    q: "qué es build 101?",
    aText: `la hackathon de IA más grande de uruguay. la primera edición fue el 17 y 18 de octubre de 2026 en la ${VENUE}.`,
  },
  {
    q: "dónde veo lo que construyeron los equipos?",
    aText: `en ${CANONICAL_URL}equipos.`,
    a: (
      <>
        en{" "}
        <Link href="/equipos" className="bracket">
          /equipos
        </Link>
        .
      </>
    ),
  },
  {
    q: "va a haber otra edición?",
    aText: "sí. seguinos en redes para enterarte primero.",
    a: (
      <>
        sí.{" "}
        <a href="#redes" className="bracket">
          seguinos en redes
        </a>{" "}
        para enterarte primero.
      </>
    ),
  },
  {
    q: "a quién le escribo?",
    aText: `participantes: ${PARTICIPANTS_EMAIL}. mentores: ${MENTORS_EMAIL}. sponsors: ${SPONSORS_EMAIL}.`,
    a: (
      <>
        participantes:{" "}
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
