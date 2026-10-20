import Link from "next/link";
import { Reveal } from "./Reveal";
import { BUILDERS, RESULTS, TEAMS, slug, subtitle, title } from "../equipos/data";
import "./results.css";

// Resultados de la final en la landing: los tres ganadores con su captura y
// los finalistas. Cada uno lleva a su bloque en /equipos.
const byNumber = (n: number) => TEAMS.find((t) => t.numero === n)!;

export function Results() {
  const podium = RESULTS.filter((r) => r.puesto !== null && r.puesto <= 3);
  const finalists = RESULTS.filter((r) => r.puesto === null || r.puesto > 3);
  return (
    <section id="resultados" className="section">
      <div className="wrap">
        <Reveal className="founders-head">
          <div>
            <p className="eyebrow">// resultados</p>
            <h2 className="h2">
              {TEAMS.length} equipos. {BUILDERS} builders.
              <br />
              un fin de semana.
            </h2>
          </div>
          <p className="founders-aside">
            Esto es lo que se construyó en build 101.
            <br />
            Conocé los proyectos y a quienes los hicieron.
          </p>
        </Reveal>

        <Reveal>
          <ol className="rs-podium">
            {podium.map((r) => {
              const t = byNumber(r.numero);
              return (
                <li key={t.numero} className={r.puesto === 1 ? "rs-first" : ""}>
                  <Link href={`/equipos#${slug(t)}`}>
                    {t.captura ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.captura} alt="" width={1200} height={750} loading="lazy" />
                    ) : null}
                    <span className="rs-place">{String(r.puesto).padStart(2, "0")}</span>
                    <span className="rs-id">
                      <span className="rs-title">{title(t)}</span>
                      <span className="rs-sub">{subtitle(t) ?? `equipo ${slug(t)}`}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <Reveal className="rs-finalists">
          <span className="rs-label">finalistas</span>
          {finalists.map((r) => {
            const t = byNumber(r.numero);
            return (
              <Link key={t.numero} href={`/equipos#${slug(t)}`}>
                {title(t)}
              </Link>
            );
          })}
        </Reveal>

        <Reveal className="rs-cta">
          <Link href="/equipos" className="btn btn-primary">
            ver los {TEAMS.length} equipos →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
