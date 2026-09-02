// ============================================================
// <build 101> — datos del evento (fuente única de verdad)
// Editá acá y se actualiza en toda la landing.
// ============================================================

/** Identidad pública del sitio. */
export const SITE_NAME = "build 101";
export const SITE_URL = "https://build101.dev";
export const CANONICAL_URL = `${SITE_URL}/`;
export const OG_IMAGE_URL = `${SITE_URL}/opengraph-image`;
export const OG_IMAGE_ALT =
  "build 101 — hackathon de 36 horas: un producto, una demo. 17 y 18 de octubre de 2026, universidad de montevideo - latu. gratis, cupos limitados.";
// el logo de marca es el avatar "b_" que renderiza la ruta /icon en build.
export const LOGO_URL = `${SITE_URL}/icon`;

/** Metadata principal para buscadores (~155 caracteres, sin cortes en SERP).
 *  Voz build 101: todo en minúsculas. */
/* El título tiene que traer los dos términos que se buscan — "hackathon
 * uruguay" y "hackathon montevideo" — más el año. Antes solo decía montevideo. */
export const SEO_TITLE =
  "build 101 — la hackathon de ia más grande de uruguay | montevideo 2026";
export const SEO_DESCRIPTION =
  "build 101 es la hackathon de ia más grande de uruguay: 36 horas en montevideo, un fin de semana, un producto, una demo. equipos de 3, gratis y con cupos limitados — las inscripciones se anuncian pronto.";

/** Descripción larga para datos estructurados (Event) y answer engines. */
export const EVENT_DESCRIPTION =
  "build 101 es una hackathon gratuita de 36 horas en uruguay para jóvenes builders: equipos de 3 personas construyen un producto real y funcionando el 17 y 18 de octubre de 2026 en la universidad de montevideo - latu, montevideo, uruguay. las inscripciones se anuncian pronto.";

/** Última actualización de contenido del sitio (bumpeala con cada anuncio real:
 *  consigna, mentores, sponsors, cronograma). Alimenta sitemap y schema. */
export const CONTENT_UPDATED_ISO = "2026-09-02T00:00:00-03:00";

/** ¿Están abiertas las inscripciones?
 *  En `false` la landing NO linkea a la postulación en ningún lugar: los CTAs,
 *  la terminal, el FAQ, el schema y /llms.txt pasan a anunciar que abren pronto.
 *  Poné `true` el día que abran (y confirmá antes APPLY_OPEN_ISO / APPLY_DEADLINE). */
export const APPLY_OPEN: boolean = false;

// Copy del estado "todavía no abrieron" — un solo lugar para editar el anuncio.
/** Etiqueta corta: reemplaza a "aplicar →" en nav, hero y footer. */
export const APPLY_SOON_LABEL = "inscripciones pronto";
/** Frase principal del bloque de inscripción. */
export const APPLY_SOON_HEADLINE = "pronto se anuncian las inscripciones.";
/** Letra chica debajo de la frase principal. */
export const APPLY_SOON_NOTE = "equipos de 3 · gratis y con cupos limitados.";

/** Link de inscripción en Luma (selección con aprobación del organizador).
 *  Solo se usa cuando APPLY_OPEN es true. */
export const LUMA_URL = "https://luma.com/2kxg61n8";

/** Perfiles oficiales (schema.org sameAs — consolidan la entidad build 101).
 *  Mientras las inscripciones estén cerradas no publicamos el Luma: sería
 *  contradictorio mandar a los buscadores a un form que decimos que no abrió.
 *  TODO(build101): agregar Instagram / X / LinkedIn cuando existan. */
export const SOCIAL_PROFILES: string[] = APPLY_OPEN ? [LUMA_URL] : [];

/** Sede. NOTA: estos valores alimentan schema.org Place/PostalAddress, que espera
 *  nombres propios con mayúsculas — se muestran en minúsculas en la capa de UI. */
export const VENUE = "Universidad de Montevideo - LATU";
export const VENUE_ADDRESS =
  "Av. Dra. María Luisa Saldún de Rodríguez 2097, Montevideo";
export const VENUE_REGION = "Montevideo";
export const VENUE_POSTAL_CODE = "11500";
/** Nueva sede FIUM en el Parque Tecnológico del LATU (inaugurada 2022).
 *  TODO(build101): verificar el pin exacto del edificio FIUM. */
export const VENUE_GEO = { lat: -34.889, lng: -56.126 };
export const VENUE_MAPS =
  "https://www.google.com/maps/search/?api=1&query=Facultad+de+Ingeniería+Universidad+de+Montevideo+FIUM";

/** Fechas (17–18 de octubre de 2026, sábado a domingo). */
export const EVENT_DATES = "17–18 oct 2026";
export const EVENT_DATES_LONG = "sábado 17 → domingo 18 de octubre, 2026";
export const EVENT_START_DATE = "2026-10-17";

/** Kickoff y cierre: sábado 08:00 → domingo 20:00 = 36 horas exactas. */
export const EVENT_KICKOFF_ISO = "2026-10-17T08:00:00-03:00";
export const EVENT_END_ISO = "2026-10-18T20:00:00-03:00";

/** Horario confirmado de sede (no se pernocta: la sede cierra de noche).
 *  El cronograma detallado está a publicar. */
export const VENUE_HOURS = [
  { day: "sábado 17", hours: "08:00 → 22:00" },
  { day: "domingo 18", hours: "08:00 → 20:00" },
];

/** Inscripciones: apertura y cierre (cuenta regresiva del bloque de inscripción).
 *  Fechas tentativas: mientras APPLY_OPEN sea false no se muestran en la landing.
 *  TODO(build101): confirmar fecha real de apertura y cierre para la fecha de octubre. */
export const APPLY_OPEN_ISO = "2026-07-01T00:00:00-03:00";
export const APPLY_DEADLINE_ISO = "2026-09-27T23:59:00-03:00";
export const APPLY_DEADLINE = "27 de septiembre, 23:59";

/** Formato. */
export const DURATION_HOURS = 36;
export const TEAM_SIZE = "3";

/** Mails directos del equipo organizador (se muestran en el footer). */
export const TEAM_EMAILS = [
  "mateo@build101.dev",
  "ramiro@build101.dev",
  "bruno@build101.dev",
];

/** Contacto principal: donde la UI muestra un solo mail (FAQ, CTAs, schema). */
export const CONTACT_EMAIL = TEAM_EMAILS[0];
