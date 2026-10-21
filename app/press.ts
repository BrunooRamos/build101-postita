// ============================================================
// <build 101> — prensa (fuente única de verdad)
// Alimenta /prensa, la franja de la landing, el schema (subjectOf) y
// /llms.txt. Para sumar una nota: agregá un objeto acá y su imagen 16:9
// (1200×675, webp) en public/prensa/. Los titulares van textuales: son citas.
// ============================================================

import { TEAM } from "./event";

export type PressItem = {
  key: string;
  outlet: string;
  /** sección del medio o formato ("crónica"), en minúsculas */
  kind: string;
  title: string;
  dek?: string;
  author?: string;
  url: string;
  /** fecha de publicación (YYYY-MM-DD) */
  date: string;
  image: string;
  /** el medio también coorganizó build 101 (se marca para ser transparentes) */
  coorg?: boolean;
};

export const PRESS: readonly PressItem[] = [
  {
    key: "elobservador",
    outlet: "El Observador",
    kind: "ciencia y tecnología",
    title:
      "De un detector de estafas a un examen que se marca con los ojos: la hackatón que dejó más de 30 emprendimientos uruguayos en un fin de semana",
    dek: "Más de 300 personas se postularon y 99 quedaron seleccionadas para construir, en 48 horas, un producto con inteligencia artificial en el centro.",
    url: "https://www.elobservador.com.uy/ciencia-y-tecnologia/de-un-detector-estafas-un-examen-que-se-marca-los-ojos-la-hackaton-que-dejo-mas-30-emprendimientos-uruguayos-un-fin-semana-n6060966",
    date: "2026-10-20",
    image: "/prensa/elobservador.webp",
  },
  {
    key: "mutuo",
    outlet: "Mutuo",
    kind: "crónica",
    title: "Así fue la Build101. Primera hackatón de IA de Uruguay",
    dek: "Qué pasó en la hackathon de IA más grande de Uruguay: el podio, los números del código, los 33 productos y por qué la coorganizaron desde Mutuo.",
    author: "Guido Iafigliola",
    url: "https://canalmutuo.com/blog/especiales/build101/",
    date: "2026-10-20",
    image: "/prensa/mutuo.webp",
    coorg: true,
  },
];

/** Contacto para medios. */
export const PRESS_EMAIL = TEAM[2].email;

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-10-20" → "20 oct 2026" (sin Date: no depende del huso horario). */
export function formatPressDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
