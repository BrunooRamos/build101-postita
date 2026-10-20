import type { Metadata } from "next";
import Link from "next/link";
import { TeamBlock } from "./TeamBlock";
import { BUILDERS, ORDERED, TEAMS } from "./data";

export const metadata: Metadata = {
  alternates: { canonical: "/equipos" },
};

export default function EquiposPage() {
  return (
    <div className="wrap">
      <header className="eq-hero">
        <p className="eyebrow">
          ~/build-101 ·{" "}
          <Link href="/#resultados" className="eq-crumb">
            resultados
          </Link>{" "}
          · equipos
        </p>
        <h1 className="h2">
          {TEAMS.length} equipos. {BUILDERS} builders.
          <br />
          un fin de semana.
        </h1>
        <p className="lede">
          Esto es lo que construyeron en build 101 y quiénes lo construyeron. Cada equipo tiene su link: copialo y compartilo.
        </p>
      </header>

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
