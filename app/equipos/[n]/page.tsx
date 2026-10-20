import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TeamBlock } from "../TeamBlock";
import { TEAMS, findTeam, slug, title } from "../data";

// /equipos/07: un equipo solo, para compartir. El título y la captura arman la
// vista previa en WhatsApp.
type Props = { params: Promise<{ n: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return TEAMS.map((t) => ({ n: slug(t) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const team = findTeam((await params).n);
  if (!team) return {};
  const name = `${title(team)} · build 101`;
  const description = team.oneliner ?? `Equipo ${slug(team)} de build 101.`;
  return {
    title: name,
    description,
    alternates: { canonical: `/equipos/${slug(team)}` },
    openGraph: { title: name, description, ...(team.captura ? { images: [team.captura] } : {}) },
  };
}

export default async function EquipoPage({ params }: Props) {
  const team = findTeam((await params).n);
  if (!team) notFound();
  const i = TEAMS.indexOf(team);
  const prev = TEAMS[i - 1];
  const next = TEAMS[i + 1];
  return (
    <div className="wrap eq-single">
      <p className="eyebrow">
        ~/build-101 ·{" "}
        <Link href="/#resultados" className="eq-crumb">
          resultados
        </Link>{" "}
        ·{" "}
        <Link href={`/equipos#${slug(team)}`} className="eq-crumb">
          equipos
        </Link>{" "}
        · {slug(team)}
      </p>
      <TeamBlock team={team} heading="h1" />
      <nav className="eq-pager" aria-label="otros equipos">
        {prev ? <Link href={`/equipos/${slug(prev)}`}>← {slug(prev)} · {title(prev)}</Link> : <span />}
        <Link href={`/equipos#${slug(team)}`}>ver los {TEAMS.length} equipos</Link>
        {next ? <Link href={`/equipos/${slug(next)}`}>{slug(next)} · {title(next)} →</Link> : <span />}
      </nav>
    </div>
  );
}
