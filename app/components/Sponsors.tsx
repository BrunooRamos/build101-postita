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
  url?: string;
};

type Tier = { key: string; label: string; size: "gold" | "silver" | "partner" | "small"; items: Sponsor[] };

// Orden y agrupación definidos por el equipo. Partners = aportes en canje.
const TIERS: Tier[] = [
  {
    key: "gold",
    label: "gold sponsors",
    size: "gold",
    items: [
      { name: "Pento", logo: "/sponsors/pento.png", w: 158, h: 78, invert: true },
      { name: "Santander", logo: "/sponsors/santander.svg", w: 158, h: 78 },
      { name: "Instituto Vidart", logo: "/sponsors/vidart.svg", w: 158, h: 78 },
      { name: "AWS", logo: "/sponsors/aws.svg", w: 118, h: 58 },
      { name: "odev.tech", logo: "/sponsors/odev.svg", w: 158, h: 78 },
      { name: "Lynk Markets", logo: "/sponsors/lynk-markets.svg", w: 158, h: 78 },
    ],
  },
  {
    key: "silver",
    label: "silver sponsors",
    size: "silver",
    items: [
      { name: "INIT", logo: "/sponsors/init.png", w: 150, h: 50 },
      { name: "IEEE", logo: "/sponsors/ieee.svg", w: 150, h: 50 },
      { name: "akua", logo: "/sponsors/akua.svg", w: 150, h: 50 },
      { name: "OrderEAT", logo: "/sponsors/ordereat.svg", w: 140, h: 27 },
    ],
  },
  {
    key: "partners",
    label: "partners",
    size: "partner",
    items: [
      { name: "nBlock", logo: "/sponsors/nblock.png", w: 128, h: 34 },
      { name: "Lazo", logo: "/sponsors/lazo.png", w: 128, h: 34 },
      { name: "PCBWay", logo: "/sponsors/pcbway.png", w: 128, h: 34 },
      { name: "Flai", logo: "/sponsors/flai.svg", w: 80, h: 34 },
      { name: "Picante", logo: "/sponsors/picante.png", w: 116, h: 42 },
      { name: "MÜTÜÖ", logo: "/sponsors/mutuo.png", w: 112, h: 34, invert: true },
    ],
  },
  {
    key: "instituciones",
    label: "instituciones que nos apoyan",
    size: "partner",
    items: [
      { name: "Embajada de EE.UU. en Uruguay · Freedom 250", logo: "/sponsors/freedom250.png", w: 150, h: 40 },
      { name: "Urucap", logo: "/sponsors/urucap.png", w: 150, h: 40 },
      { name: "ANII", logo: "/sponsors/anii.png", w: 150, h: 40 },
      { name: "Club del Inversor", logo: "/sponsors/club-del-inversor.png", w: 150, h: 40 },
    ],
  },
  {
    key: "energia",
    label: "nos dan energía",
    size: "small",
    items: [
      { name: "Rigor", logo: "/sponsors/rigor.png", w: 150, h: 36 },
      { name: "Chajá", logo: "/sponsors/chaja.png", w: 150, h: 36 },
      { name: "Grupo Sebamar", logo: "/sponsors/sebamar.png", w: 150, h: 36 },
      { name: "Los Trovadores", logo: "/sponsors/los-trovadores.png", w: 150, h: 36 },
      { name: "Viandas Hotel del Prado", logo: "/sponsors/viandas-hotel-del-prado.png", w: 150, h: 36 },
    ],
  },
];

function Logo({ s }: { s: Sponsor }) {
  const style = { "--w": `${s.w}px`, "--h": `${s.h}px` } as CSSProperties;
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={s.logo} alt={s.name} loading="lazy" className={s.invert ? "invert" : undefined} />;
  return (
    <li className="sponsor" style={style}>
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
