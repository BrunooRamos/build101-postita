import type { CSSProperties } from "react";
import { Reveal } from "./Reveal";
import { SPONSORS_EMAIL } from "../event";
import { TIERS, type Sponsor } from "../sponsors";

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

        {TIERS.map((t) => {
          const grid = `sponsor-grid size-${t.size}${t.cols ? ` cols-${t.cols}` : ""}`;
          const featured = t.items.filter((s) => s.featured);
          const rest = t.items.filter((s) => !s.featured);
          return (
            <Reveal key={t.key} className="tier">
              <h3 className="tier-tab">{t.label}</h3>
              {featured.length ? (
                // destacados en una fila propia arriba, más grandes; el resto debajo
                <div className="sponsor-stack">
                  <ul className="sponsor-grid sponsor-featured">
                    {featured.map((s) => (
                      <Logo key={s.name} s={s} />
                    ))}
                  </ul>
                  <ul className={grid}>
                    {rest.map((s) => (
                      <Logo key={s.name} s={s} />
                    ))}
                  </ul>
                </div>
              ) : (
                <ul className={grid}>
                  {t.items.map((s) => (
                    <Logo key={s.name} s={s} />
                  ))}
                </ul>
              )}
            </Reveal>
          );
        })}

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
