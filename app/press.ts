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
  /** la nota es sobre un proyecto puntual de build 101, no sobre el evento */
  project?: string;
};

export const PRESS: readonly PressItem[] = [
  {
    key: "enperspectiva",
    outlet: "Radiomundo En Perspectiva",
    kind: "entrevista",
    title:
      "Kauto, la aplicación creada por estudiantes de Ingeniería de la Universidad ORT que identifica en tiempo real si una llamada está asociada a una estafa o no. Con Bruno Colo y Pedro Morga",
    dek: "La herramienta busca alertar, especialmente a los adultos mayores, ante posibles fraudes telefónicos. Sus creadores cuentan cómo surgió la idea y cómo funciona.",
    url: "https://enperspectiva.uy/en-perspectiva-programa/kauto-la-aplicacion-creada-por-estudiantes-de-ingenieria-de-la-universidad-ort-que-identifica-en-tiempo-real-si-una-llamada-esta-asociada-a-una-estafa-o-no-con-bruno-colo-y-pedro-morga/",
    date: "2026-11-04",
    image: "/prensa/enperspectiva.webp",
    project: "Kauto",
  },
  {
    key: "subrayado",
    outlet: "Subrayado",
    kind: "sociedad",
    title:
      "Estudiantes desarrollaron una aplicación para prevenir estafas y buscan financiación para que llegue a más personas",
    dek: "Un grupo de estudiantes universitarios desarrolló una aplicación para evitar las estafas telefónicas mientras la llamada está en curso y alerta a la familia de la víctima.",
    url: "https://www.subrayado.com.uy/estudiantes-desarrollaron-una-aplicacion-prevenir-estafas-y-buscan-financiacion-que-llegue-mas-personas-n1022492",
    date: "2026-11-02",
    image: "/prensa/subrayado.webp",
    project: "Kauto",
  },
  {
    // "Guardián" no es un error del medio: así se llamó la app en la hackathon;
    // después pasó a ser Kauto.
    key: "elobservador-kauto",
    outlet: "El Observador",
    kind: "ciencia y tecnología",
    title:
      "Estudiantes uruguayos crean una app que avisa a un familiar en tiempo real si la víctima está siendo estafada",
    dek: "Guardián fue la propuesta ganadora entre más de 30 en Build101; fue entrenada con modalidades de estafa conocidas en Uruguay y su equipo ya se presentó a un fondo de la ANII.",
    author: "Juan Pablo De Marco",
    url: "https://www.elobservador.com.uy/ciencia-y-tecnologia/estudiantes-uruguayos-crean-una-app-que-avisa-un-familiar-tiempo-real-si-la-victima-esta-siendo-estafada-n6061967",
    date: "2026-10-29",
    image: "/prensa/elobservador-kauto.webp",
    project: "Kauto",
  },
  {
    key: "ort",
    outlet: "Universidad ORT",
    kind: "novedades",
    title: "Crearon una aplicación con IA para prevenir estafas y ganaron una hackatón",
    dek: "Bruno Colo, Pedro Morga y Matías Moser, estudiantes de Ingeniería en Sistemas, obtuvieron el primer premio de Build 101, una hackatón de inteligencia artificial que reunió a 33 equipos para desarrollar soluciones tecnológicas en un fin de semana.",
    url: "https://fi.ort.edu.uy/novedades/crearon-una-aplicacion-con-ia-para-prevenir-estafas-y-ganaron-una-hackaton",
    date: "2026-10-26",
    image: "/prensa/ort.webp",
    project: "Kauto",
  },
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
