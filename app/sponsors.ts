// Sponsors por categoría: única fuente para la sección visible
// (components/Sponsors.tsx), /llms.txt y el JSON-LD del evento
// (components/StructuredData.tsx). Lo que ve un agente al scrapear sale de acá,
// así que nunca diverge de lo que ve una persona.

export type Sponsor = {
  name: string;
  logo: string;
  /** Caja máxima del logo dentro de la tarjeta (px, desktop). */
  w: number;
  h: number;
  /** Logos blancos pensados para fondo oscuro: se invierten sobre la tarjeta blanca. */
  invert?: boolean;
  /** Web del sponsor: la tarjeta entera linkea ahí (en otra pestaña). */
  url?: string;
  /** Destacado dentro de su categoría: va en una fila propia arriba, con
   *  tarjeta y logo más grandes. */
  featured?: boolean;
  /** Logo alto (casi cuadrado): menos relleno vertical para que no quede chico
   *  en una tarjeta baja y ancha. */
  tight?: boolean;
};

export type Tier = {
  key: string;
  label: string;
  size: "gold" | "silver" | "partner" | "small";
  /** Columnas en desktop cuando no coinciden con las del tamaño (para que la fila quede completa). */
  cols?: 4 | 6 | 7;
  items: Sponsor[];
};

// Orden y agrupación definidos por el equipo. Partners = aportes en canje.
export const TIERS: Tier[] = [
  {
    key: "gold",
    label: "gold sponsors",
    size: "gold",
    items: [
      { name: "Toyota", logo: "/sponsors/toyota.svg", w: 158, h: 78, url: "https://www.toyota.com.uy" },
      { name: "Pento", logo: "/sponsors/pento-color.png", w: 158, h: 78, url: "https://pento.ai" },
      { name: "Santander", logo: "/sponsors/santander.svg", w: 158, h: 78, url: "https://www.santander.com.uy" },
      { name: "Instituto Vidart", logo: "/sponsors/vidart.svg", w: 158, h: 78, url: "https://vidart.uy" },
      { name: "AWS", logo: "/sponsors/aws.svg", w: 118, h: 58, url: "https://aws.amazon.com" },
      { name: "odev.tech", logo: "/sponsors/odev.svg", w: 158, h: 78, url: "https://odev.tech" },
      { name: "Lynk Markets", logo: "/sponsors/lynk-markets.svg", w: 158, h: 78, url: "https://lynkmarkets.com" },
      { name: "Mozart", logo: "/sponsors/mozart.svg", w: 158, h: 78, url: "https://mozarth.com" },
      { name: "Nowports", logo: "/sponsors/nowports.png", w: 158, h: 78, url: "https://www.nowports.com" },
    ],
  },
  {
    key: "silver",
    label: "silver sponsors",
    size: "silver",
    items: [
      { name: "INIT", logo: "/sponsors/init.svg", w: 150, h: 50, url: "https://init.uy" },
      { name: "IEEE", logo: "/sponsors/ieee.svg", w: 150, h: 50, url: "https://r9.ieee.org/uruguay/" },
      { name: "akua", logo: "/sponsors/akua.svg", w: 150, h: 50, url: "https://akua.la" },
      { name: "OrderEAT", logo: "/sponsors/ordereat.svg", w: 140, h: 27, url: "https://www.ordereat.com" },
      { name: "Horizon", logo: "/sponsors/horizon.svg", w: 140, h: 27, url: "https://usehorizon.ai" },
      { name: "Promtior", logo: "/sponsors/promtior.svg", w: 150, h: 27, url: "https://www.promtior.ai" },
    ],
  },
  {
    key: "partners",
    label: "partners",
    size: "partner",
    cols: 7,
    items: [
      { name: "nBlock", logo: "/sponsors/nblock.png", w: 128, h: 34, url: "https://www.nblock.ai" },
      { name: "Lazo", logo: "/sponsors/lazo.png", w: 128, h: 34, url: "https://www.lazo.us" },
      { name: "Neocard", logo: "/sponsors/neocard.png", w: 158, h: 34, url: "https://www.neocard.com.uy" },
      { name: "Flai", logo: "/sponsors/flai.svg", w: 80, h: 34, url: "https://www.useflai.com" },
      { name: "Picante", logo: "/sponsors/picante.png", w: 116, h: 42 },
      { name: "Tenki", logo: "/sponsors/tenki.svg", w: 128, h: 34, url: "https://tenki.cloud" },
      { name: "Xiaomi", logo: "/sponsors/xiaomi.png", w: 44, h: 44, url: "https://www.mi.com/latin-es/", tight: true },
    ],
  },
  {
    key: "instituciones",
    label: "instituciones que nos apoyan",
    size: "partner",
    cols: 4,
    items: [
      { name: "Embajada de EE.UU. en Uruguay · Freedom 250", logo: "/sponsors/freedom250.png", w: 120, h: 72, url: "https://uy.usembassy.gov", tight: true },
      { name: "Urucap", logo: "/sponsors/urucap.png", w: 150, h: 40, url: "https://www.urucap.org" },
      { name: "ANII", logo: "/sponsors/anii.png", w: 104, h: 28, url: "https://www.anii.org.uy" },
      { name: "Club del Inversor", logo: "/sponsors/club-del-inversor.png", w: 150, h: 40, url: "https://www.clubdelinversor.uy" },
      { name: "CUTI", logo: "/sponsors/cuti.svg", w: 150, h: 40, url: "https://cuti.org.uy" },
      { name: "Initium · Universidad de Montevideo", logo: "/sponsors/initium.png", w: 150, h: 39, url: "https://www.um.edu.uy/initium" },
      { name: "Ingenio · incubadora del LATU", logo: "/sponsors/ingenio.svg", w: 132, h: 40, invert: true, url: "https://ingenio.org.uy" },
      { name: "Instituto CPE", logo: "/sponsors/instituto-cpe.png", w: 130, h: 48, url: "https://institutocpe.edu.uy" },
    ],
  },
  {
    key: "energia",
    label: "nos dan energía",
    size: "small",
    items: [
      { name: "Conaprole", logo: "/sponsors/conaprole.svg", w: 150, h: 76, featured: true, url: "https://www.conaprole.uy" },
      { name: "Salus", logo: "/sponsors/salus.svg", w: 150, h: 36, featured: true, url: "https://www.salus.com.uy" },
      { name: "McDonald's", logo: "/sponsors/mcdonalds.svg", w: 44, h: 44, url: "https://www.mcdonalds.com.uy", tight: true },
      { name: "Pepsi", logo: "/sponsors/pepsi.png", w: 48, h: 48, url: "https://www.pepsi.com", tight: true },
      { name: "Rigor", logo: "/sponsors/rigor.png", w: 150, h: 30, url: "https://www.rigorpizza.com" },
      { name: "Chajá", logo: "/sponsors/chaja.png", w: 150, h: 36, url: "https://www.instagram.com/chajabistro/" },
      { name: "Grupo Sebamar", logo: "/sponsors/sebamar.png", w: 150, h: 48, tight: true, url: "https://sebamar.com.uy" },
      { name: "Los Trovadores", logo: "/sponsors/los-trovadores-dark.png", w: 150, h: 36, url: "https://www.lostrovadores.com.uy" },
      { name: "Viandas Hotel del Prado", logo: "/sponsors/viandas-hotel-del-prado.png", w: 150, h: 36, url: "https://viandashoteldelprado.uy" },
      { name: "Life Cinemas", logo: "/sponsors/life-cinemas.png", w: 150, h: 40, url: "https://www.lifecinemas.com.uy" },
    ],
  },
];
