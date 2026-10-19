import type { Metadata } from "next";
import { TeamBlock } from "./TeamBlock";
import { BUILDERS, TEAMS, slug, title } from "./data";

export const metadata: Metadata = {
  alternates: { canonical: "/equipos" },
};

export default function EquiposPage() {
  const demos = TEAMS.filter((t) => t.demo).length;
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
        <p className="eq-receipt mono-line">
          $ build101 --equipos · {TEAMS.length} proyectos · {demos} con demo público
        </p>
      </header>

      <nav className="eq-index" aria-label="ir a un equipo">
        {TEAMS.map((t) => (
          <a key={t.numero} href={`#${slug(t)}`} className={t.demo ? "has-demo" : ""} title={title(t)}>
            <span>{slug(t)}</span>
            {title(t)}
          </a>
        ))}
      </nav>

      <div className="eq-list">
        {TEAMS.map((t) => (
          <TeamBlock key={t.numero} team={t} />
        ))}
      </div>

      <p className="eq-sign mono-line">build. ship. repeat.</p>
    </div>
  );
}
