// ============================================================
// <build 101> — datos del evento (fuente única de verdad)
// Editá acá y se actualiza en toda la landing, el schema y /llms.txt.
// ============================================================

/** Identidad pública del sitio. */
export const SITE_NAME = "build 101";
export const SITE_URL = "https://build101.dev";
export const CANONICAL_URL = `${SITE_URL}/`;
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;
export const OG_IMAGE_ALT =
  "build 101: la hackathon de IA más grande de uruguay. 17 y 18 de octubre de 2026, universidad de montevideo · fium, latu. gratis, cupos limitados.";
// el logo de marca es el avatar "b_" que renderiza la ruta /icon en build.
export const LOGO_URL = `${SITE_URL}/icon`;

/** Metadata principal para buscadores (~155 caracteres, sin cortes en SERP).
 *  El título trae los dos términos que se buscan — "hackathon uruguay" y
 *  "hackathon montevideo" — más el año. */
export const SEO_TITLE =
  "build 101: la hackathon de IA más grande de uruguay | montevideo 2026";
export const SEO_DESCRIPTION =
  "build 101 es la hackathon de IA más grande de uruguay: un fin de semana en montevideo para construir un producto de IA y pitchearlo en vivo. gratis, cupos limitados.";

/** Descripción larga para datos estructurados (Event) y answer engines. */
export const EVENT_DESCRIPTION =
  "build 101 es una hackathon gratuita y presencial en uruguay: equipos de 3 personas construyen un producto de inteligencia artificial y lo pitchean en vivo frente a un jurado, el 17 y 18 de octubre de 2026 en la universidad de montevideo · fium, latu, montevideo.";

/** Última actualización de contenido del sitio (bumpeala con cada anuncio real:
 *  consigna, mentores, jurado, sponsors, cronograma). Alimenta sitemap y schema. */
export const CONTENT_UPDATED_ISO = "2026-09-28T00:00:00-03:00";

/** ¿Están abiertas las inscripciones?
 *  En `false` la landing no linkea al formulario: los CTAs, la terminal, el FAQ,
 *  el schema y /llms.txt anuncian que abren pronto, y /api/inscripcion rechaza
 *  envíos. */
export const APPLY_OPEN: boolean = true;

// Copy del estado "todavía no abrieron" — un solo lugar para editar el anuncio.
export const APPLY_SOON_LABEL = "inscripciones pronto";

/** Ruta del formulario propio (elegir camino: con equipo o buscando uno). */
export const APPLY_PATH = "/inscripcion";
export const APPLY_URL = `${SITE_URL}${APPLY_PATH}`;

/** Redes oficiales: se muestran en el footer y alimentan schema.org sameAs
 *  (consolidan la entidad build 101). */
export const SOCIALS = [
  { key: "instagram", label: "Instagram", handle: "@build101.dev", url: "https://www.instagram.com/build101.dev/" },
  { key: "linkedin", label: "LinkedIn", handle: "build 101", url: "https://www.linkedin.com/company/build101/" },
  { key: "x", label: "X", handle: "@build101dev", url: "https://x.com/build101dev" },
] as const;
export const SOCIAL_PROFILES: string[] = SOCIALS.map((s) => s.url);

/** Sede. La edición la hace la Facultad de Ingeniería (FIUM) en su edificio del
 *  LATU. NOTA: estos valores alimentan schema.org Place/PostalAddress. */
export const VENUE = "Universidad de Montevideo · FIUM, LATU";
export const VENUE_SHORT = "FIUM · LATU";
export const VENUE_ADDRESS =
  "Av. Dra. María Luisa Saldún de Rodríguez 2097, Montevideo";
export const VENUE_REGION = "Montevideo";
export const VENUE_POSTAL_CODE = "11500";
/** Sede FIUM en el Parque Tecnológico del LATU.
 *  TODO(build101): verificar el pin exacto del edificio. */
export const VENUE_GEO = { lat: -34.889, lng: -56.126 };
export const VENUE_MAPS =
  "https://www.google.com/maps/search/?api=1&query=Facultad+de+Ingeniería+Universidad+de+Montevideo+FIUM";

/** Fechas (17 y 18 de octubre de 2026, sábado y domingo). */
export const EVENT_DATES = "17 y 18 oct 2026";
export const EVENT_DATES_LONG = "sábado 17 y domingo 18 de octubre de 2026";
export const EVENT_START_DATE = "2026-10-17";

/** Apertura del sábado y cierre aproximado del domingo. */
export const EVENT_KICKOFF_ISO = "2026-10-17T09:00:00-03:00";
export const EVENT_END_ISO = "2026-10-18T15:00:00-03:00";

/** Horario de la sede (no se pernocta: la sede cierra de noche). */
export const SCHEDULE = [
  {
    day: "sábado 17",
    hours: "09:00 a 21:00",
    note: "Nos encontramos, arrancamos y construimos.",
  },
  {
    day: "domingo 18",
    hours: "09:00 a ~15:00",
    note: "Retomamos, pitcheamos los productos y cerramos.",
  },
];

/** Inscripciones: cierre. */
export const APPLY_DEADLINE_ISO = "2026-10-09T23:59:00-03:00";
export const APPLY_DEADLINE = "9 de octubre";
/** Hora de cierre (hora de Uruguay). Mostrarla siempre junto a la fecha. */
export const APPLY_DEADLINE_TIME = "23:59 hs";
/** Fecha y hora de cierre, para cualquier texto que hable del límite. */
export const APPLY_DEADLINE_FULL = `${APPLY_DEADLINE}, ${APPLY_DEADLINE_TIME}`;

/** ¿Se puede enviar una inscripción ahora? `APPLY_OPEN` y además antes del
 *  cierre (se acepta hasta el final del minuto 23:59). La API lo chequea en
 *  cada envío y el formulario al abrirse, así el cierre es automático aunque
 *  nadie cambie `APPLY_OPEN`. Las páginas estáticas (textos de la landing)
 *  siguen dependiendo de `APPLY_OPEN`: pasalo a `false` después del cierre. */
export function isApplyOpen(now = Date.now()) {
  return APPLY_OPEN && now < Date.parse(APPLY_DEADLINE_ISO) + 60_000;
}

/** Formato. */
export const TEAM_SIZE = "3";

/** Organizadores. El orden es el de la landing (participantes · mentores ·
 *  sponsors). Los mails se muestran solo en el footer. */
export const TEAM = [
  {
    key: "ramiro",
    name: "Ramiro",
    role: "Participants Lead",
    area: "participants",
    email: "ramiro@build101.dev",
    linkedin: "https://www.linkedin.com/in/ramiro-colo-martinez/",
    photo: "/team/ramiro.webp",
    school: { name: "Universidad de Montevideo", detail: "Software Engineering", logo: "/team/um.png" },
    work: { name: "OrderEAT", detail: "Product Engineer", logo: "/team/ordereat.jpg" },
  },
  {
    key: "bruno",
    name: "Bruno",
    role: "Mentors Lead",
    area: "mentors",
    email: "bruno@build101.dev",
    linkedin: "https://www.linkedin.com/in/bruno-ramos-um/",
    photo: "/team/bruno.webp",
    school: { name: "Universidad de Montevideo", detail: "Software Engineering", logo: "/team/um.png" },
    work: { name: "Horizon", detail: "AI Product Engineer", logo: "/team/horizon.jpg" },
  },
  {
    key: "mateo",
    name: "Mateo",
    role: "Sponsors Lead",
    area: "sponsors",
    email: "mateo@build101.dev",
    linkedin: "https://www.linkedin.com/in/mateovidalsilva/",
    photo: "/team/mateo.webp",
    school: { name: "Universidad de la República", detail: "Electrical Engineering", logo: "/team/udelar-fing.jpg" },
    work: { name: "nBlock", detail: "Founding Engineer", logo: "/team/nblock.jpg" },
  },
] as const;

export const TEAM_EMAILS = TEAM.map((p) => p.email);

/** Contactos por intención. */
export const PARTICIPANTS_EMAIL = TEAM[0].email;
export const MENTORS_EMAIL = TEAM[1].email;
export const SPONSORS_EMAIL = TEAM[2].email;

/** Contacto principal: donde la UI o el schema muestran un solo mail. */
export const CONTACT_EMAIL = PARTICIPANTS_EMAIL;
