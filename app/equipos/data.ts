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
  /** /equipos/fotos/<archivo>; sin foto se muestran las iniciales. */
  foto: string | null;
};

export type Team = {
  numero: number;
  equipo: string | null;
  producto: string | null;
  oneliner: string | null;
  stack: string[];
  demo: string | null;
  repos: string[];
  captura: string | null;
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
