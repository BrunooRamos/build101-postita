import type { CSSProperties } from "react";
import { Reveal } from "./Reveal";
import { SPONSORS_EMAIL } from "../event";

type Sponsor = {
  name: string;
  logo: string;
  /** Caja máxima del logo dentro de la tarjeta (px, desktop). */
  w: number;
  h: number;
  /** Logos blancos pensados para fondo oscuro: se invierten sobre la tarjeta blanca. */
  invert?: boolean;
  /** Web del sponsor: la tarjeta entera linkea ahí (en otra pestaña). */
  url?: string;
  /** Destacado dentro de su categoría: tarjeta y logo un poco más grandes. */
  featured?: boolean;
  /** Logo alto (casi cuadrado): menos relleno vertical para que no quede chico
   *  en una tarjeta baja y ancha. */
  tight?: boolean;
};

type Tier = { key: string; label: string; size: "gold" | "silver" | "partner" | "small"; items: Sponsor[] };

// Orden y agrupación definidos por el equipo. Partners = aportes en canje.
const TIERS: Tier[] = [
  {
    key: "gold",
    label: "gold sponsors",
    size: "gold",
    items: [
      { name: "Pento", logo: "/sponsors/pento.png", w: 158, h: 78, invert: true, url: "https://pento.ai" },
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
      { name: "INIT", logo: "/sponsors/init.png", w: 150, h: 50, url: "https://init.uy" },
      { name: "IEEE", logo: "/sponsors/ieee.svg", w: 150, h: 50, url: "https://r9.ieee.org/uruguay/" },
      { name: "akua", logo: "/sponsors/akua.svg", w: 150, h: 50, url: "https://akua.la" },
      { name: "OrderEAT", logo: "/sponsors/ordereat.svg", w: 140, h: 27, url: "https://www.ordereat.com" },
    ],
  },
  {
    key: "partners",
    label: "partners",
    size: "partner",
    items: [
      { name: "nBlock", logo: "/sponsors/nblock.png", w: 128, h: 34, url: "https://www.nblock.ai" },
      { name: "Lazo", logo: "/sponsors/lazo.png", w: 128, h: 34, url: "https://www.lazo.us" },
      { name: "PCBWay", logo: "/sponsors/pcbway.png", w: 128, h: 34, url: "https://www.pcbway.com" },
      { name: "Flai", logo: "/sponsors/flai.svg", w: 80, h: 34, url: "https://www.useflai.com" },
      { name: "Picante", logo: "/sponsors/picante.png", w: 116, h: 42 },
    ],
  },
  {
    key: "instituciones",
    label: "instituciones que nos apoyan",
    size: "partner",
    items: [
      { name: "Embajada de EE.UU. en Uruguay · Freedom 250", logo: "/sponsors/freedom250.png", w: 120, h: 72, url: "https://uy.usembassy.gov", tight: true },
      { name: "Urucap", logo: "/sponsors/urucap.png", w: 150, h: 40, url: "https://www.urucap.org" },
      { name: "ANII", logo: "/sponsors/anii.png", w: 104, h: 28, url: "https://www.anii.org.uy" },
      { name: "Club del Inversor", logo: "/sponsors/club-del-inversor.png", w: 150, h: 40, url: "https://www.clubdelinversor.uy" },
      { name: "CUTI", logo: "/sponsors/cuti.svg", w: 150, h: 40, url: "https://cuti.org.uy" },
    ],
  },
  {
    key: "energia",
    label: "nos dan energía",
    size: "small",
    items: [
      { name: "Salus", logo: "/sponsors/salus.svg", w: 150, h: 36, url: "https://www.salus.com.uy", featured: true },
      { name: "Rigor", logo: "/sponsors/rigor.png", w: 150, h: 30, url: "https://www.rigorpizza.com" },
      { name: "Chajá", logo: "/sponsors/chaja.png", w: 150, h: 36, url: "https://www.instagram.com/chajabistro/" },
      { name: "Grupo Sebamar", logo: "/sponsors/sebamar.png", w: 150, h: 36, url: "https://sebamar.com.uy" },
      { name: "Los Trovadores", logo: "/sponsors/los-trovadores-dark.png", w: 150, h: 36, url: "https://www.lostrovadores.com.uy" },
      { name: "Viandas Hotel del Prado", logo: "/sponsors/viandas-hotel-del-prado.png", w: 150, h: 36, url: "https://viandashoteldelprado.uy" },
    ],
  },
];

function Logo({ s }: { s: Sponsor }) {
  const style = { "--w": `${s.w}px`, "--h": `${s.h}px` } as CSSProperties;
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={s.logo} alt={s.name} loading="lazy" className={s.invert ? "invert" : undefined} />;
  return (
    <li className={["sponsor", s.featured && "featured", s.tight && "tight"].filter(Boolean).join(" ")} style={style}>
      {s.url ? (
        <a href={s.url} target="_blank" rel="noopener noreferrer sponsored">
          {img}
        </a>
      ) : (
        img
      )}
    </li>
  );
}

export function Sponsors() {
  return (
    <section id="sponsors" className="section">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">// nos acompañan</p>
          <h2 className="h2">build 101 se construye en equipo.</h2>
          <p className="lede">Organizaciones que hacen posible este encuentro.</p>
        </Reveal>

        {TIERS.map((t) => (
          <Reveal key={t.key} className="tier">
            <p className="eyebrow">// {t.label}</p>
            <ul className={`sponsor-grid size-${t.size}`}>
              {t.items.map((s) => (
                <Logo key={s.name} s={s} />
              ))}
            </ul>
          </Reveal>
        ))}

        <Reveal className="sponsors-cta">
          <p>¿querés que tu organización sea parte?</p>
          <a href={`mailto:${SPONSORS_EMAIL}`} className="btn btn-ghost">
            hablá con Mateo ↗
          </a>
        </Reveal>
      </div>
    </section>
  );
}
