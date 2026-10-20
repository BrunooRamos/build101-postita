import type { Metadata } from "next";
import { TeamBlock } from "./TeamBlock";
import { BUILDERS, ORDERED, RESULTS, TEAMS, placeLabel, slug, subtitle, title } from "./data";

export const metadata: Metadata = {
  alternates: { canonical: "/equipos" },
};

const byNumber = (n: number) => TEAMS.find((t) => t.numero === n)!;

export default function EquiposPage() {
  const podium = RESULTS.filter((r) => r.puesto !== null && r.puesto <= 3);
  const finalists = RESULTS.filter((r) => r.puesto === null || r.puesto > 3);
  return (
    <div className="wrap">
      <header className="eq-hero">
        <p className="eyebrow">~/build-101 · equipos</p>
        <h1 className="h2">
          {TEAMS.length} equipos. {BUILDERS} builders.
          <br />
          un fin de semana.
        </h1>
        <p className="lede">
          Esto es lo que construyeron en build 101 y quiénes lo construyeron. Cada equipo tiene su link: copialo y compartilo.
        </p>
      </header>

      <section className="eq-results" aria-labelledby="eq-ganadores">
        <p className="eyebrow" id="eq-ganadores">
          // ganadores
        </p>
        <ol className="eq-podium">
          {podium.map((r) => {
            const t = byNumber(r.numero);
            return (
              <li key={t.numero} className={`eq-podium-${r.puesto}`}>
                <a href={`#${slug(t)}`}>
                  {t.captura ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.captura} alt="" width={1200} height={750} loading="lazy" />
                  ) : null}
                  <span className="eq-podium-place">{String(r.puesto).padStart(2, "0")}</span>
                  <span className="eq-podium-id">
                    <span className="eq-podium-title">{title(t)}</span>
                    <span className="eq-podium-sub">{subtitle(t) ?? `equipo ${slug(t)}`}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ol>

        <p className="eyebrow eq-finalists-label">// finalistas</p>
        <ol className="eq-finalists">
          {finalists.map((r) => {
            const t = byNumber(r.numero);
            return (
              <li key={t.numero}>
                <a href={`#${slug(t)}`}>
                  <span className="eq-finalists-place">{r.puesto === null ? "—" : `${r.puesto}º`}</span>
                  <span className="eq-finalists-title">{title(t)}</span>
                  <span className="eq-finalists-sub">{subtitle(t) ?? `equipo ${slug(t)}`}</span>
                  {r.puesto === 8 ? <span className="eq-finalists-note">empate</span> : null}
                  {r.puesto === null ? <span className="eq-finalists-note">{placeLabel(null)}</span> : null}
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      <p className="eyebrow eq-all-label">// los {TEAMS.length} equipos</p>
      <div className="eq-list">
        {ORDERED.map((t) => (
          <TeamBlock key={t.numero} team={t} />
        ))}
      </div>

      <p className="eq-sign mono-line">build. ship. repeat.</p>
    </div>
  );
}
