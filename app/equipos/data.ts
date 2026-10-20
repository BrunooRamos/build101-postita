import equipos from "./equipos.json";

// Catálogo de equipos y builders de build 101. Los datos salen de la nómina de
// acreditaciones (equipos e integrantes), de las postulaciones (estudio,
// trabajo y LinkedIn, con el consentimiento de cada uno) y de los repos (qué
// construyeron, demo y captura). Se editan a mano en equipos.json.

export type Builder = {
  nombre: string;
  estudia: string | null;
  trabaja: string | null;
  link: string | null;
  /** Qué hizo en el proyecto, sacado de sus commits. */
  aporte?: string | null;
  /** /equipos/fotos/<archivo>; sin foto se muestran las iniciales. */
  foto: string | null;
};

export type Team = {
  numero: number;
  equipo: string | null;
  producto: string | null;
  oneliner: string | null;
  /** Cómo está hecho, en letra chica. */
  detalle?: string | null;
  stack: string[];
  demo: string | null;
  repos: string[];
  captura: string | null;
  /** Foto del equipo durante el evento. */
  fotoEquipo: string | null;
  /** Pitch, video o afiche que subió el equipo (links de Drive). */
  material: { tipo: string; url: string }[];
  integrantes: Builder[];
};

export const TEAMS = equipos as Team[];

/** "07": el número del equipo, que también es su ancla y su URL. */
export const slug = (t: Team) => String(t.numero).padStart(2, "0");

export const findTeam = (s: string) => TEAMS.find((t) => slug(t) === s);

/** El nombre grande: el producto si lo tiene, si no el del equipo. */
export const title = (t: Team) => t.producto ?? t.equipo ?? `equipo ${slug(t)}`;

/** El nombre chico, solo si dice algo distinto del título. */
export function subtitle(t: Team) {
  const name = t.equipo ?? `equipo ${slug(t)}`;
  return name.toLowerCase() === title(t).toLowerCase() ? null : name;
}

export const host = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const BUILDERS = TEAMS.reduce((n, t) => n + t.integrantes.length, 0);

/**
 * Resultados de la final. `puesto` es el lugar en la votación; Luxis y Sin
 * Dormir empataron en el 8º. Argos fue finalista sin puesto anunciado.
 */
export const RESULTS: { numero: number; puesto: number | null }[] = [
  { numero: 12, puesto: 1 },
  { numero: 14, puesto: 2 },
  { numero: 32, puesto: 3 },
  { numero: 11, puesto: 4 },
  { numero: 1, puesto: 5 },
  { numero: 6, puesto: 6 },
  { numero: 3, puesto: 7 },
  { numero: 31, puesto: 8 },
  { numero: 25, puesto: 8 },
  { numero: 18, puesto: null },
];

export const result = (t: Team) => RESULTS.find((r) => r.numero === t.numero) ?? null;

/** Ganadores, después finalistas por puesto, después el resto por número. */
export const ORDERED = [
  ...RESULTS.map((r) => TEAMS.find((t) => t.numero === r.numero)!),
  ...TEAMS.filter((t) => !result(t)),
];

/** "1er puesto", "8º puesto", o "finalista" si no tiene puesto. */
export function placeLabel(puesto: number | null) {
  if (puesto === null) return "finalista";
  return puesto === 1 ? "1er puesto" : puesto === 3 ? "3er puesto" : `${puesto}º puesto`;
}
