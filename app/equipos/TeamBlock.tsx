import Link from "next/link";
import { LinkedInIcon } from "../components/Founders";
import { CopyLink } from "./CopyLink";
import { host, initials, slug, subtitle, title, type Builder, type Team } from "./data";

// Un equipo: número, producto y one-liner, captura del demo y los tres
// builders. Se usa en la lista (/equipos, con ancla #07) y en la página propia
// (/equipos/07).
export function TeamBlock({ team, heading = "h2" }: { team: Team; heading?: "h1" | "h2" }) {
  const n = slug(team);
  const H = heading;
  const sub = subtitle(team);
  return (
    <article id={n} className="eq-team" aria-labelledby={`eq-${n}`}>
      <header className="eq-head">
        <Link href={`/equipos/${n}`} className="eq-num" aria-label={`equipo ${n}`}>
          {n}
        </Link>
        <div className="eq-titles">
          <H id={`eq-${n}`} className="eq-title">
            {title(team)}
          </H>
          {sub ? <p className="eq-sub">// {sub}</p> : null}
        </div>
        <CopyLink path={`/equipos/${n}`} label={title(team)} />
      </header>

      <div className={`eq-body ${team.captura ? "" : "eq-body-noshot"}`}>
        <div className="eq-about">
          {team.oneliner ? <p className="eq-oneliner">{team.oneliner}</p> : <p className="eq-oneliner eq-muted">el proyecto todavía no está publicado.</p>}
          {team.stack.length ? (
            <ul className="eq-stack" aria-label="stack">
              {team.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : null}
          <div className="eq-links">
            {team.demo ? (
              <a href={team.demo} target="_blank" rel="noopener noreferrer" className="eq-link eq-link-demo">
                <span>$ open</span> {host(team.demo)} ↗
              </a>
            ) : null}
            {team.repos.map((r) => (
              <a key={r} href={r} target="_blank" rel="noopener noreferrer" className="eq-link">
                <span>$ git</span> {host(r).replace(/^github\.com\//, "")} ↗
              </a>
            ))}
            {team.material.map((m) => (
              <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer" className="eq-link">
                <span>$ ver</span> {m.tipo} ↗
              </a>
            ))}
          </div>
          {team.fotoEquipo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="eq-group" src={team.fotoEquipo} alt={`el equipo ${title(team)} en build 101`} width={1200} height={900} loading="lazy" />
          ) : null}
        </div>
        {team.captura ? (
          <a href={team.demo ?? undefined} target="_blank" rel="noopener noreferrer" className="eq-shot" tabIndex={-1} aria-hidden>
            <span className="eq-shot-bar">
              <i />
              <i />
              <i />
              <span>{team.demo ? host(team.demo) : ""}</span>
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={team.captura} alt="" width={1200} height={750} loading="lazy" />
          </a>
        ) : null}
      </div>

      <ul className="eq-people">
        {team.integrantes.map((p) => (
          <Person key={p.nombre} p={p} />
        ))}
      </ul>
    </article>
  );
}

function Person({ p }: { p: Builder }) {
  const linkedin = p.link?.includes("linkedin.com");
  return (
    <li className="eq-person">
      <div className="eq-photo">
        {p.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.foto} alt={`foto de ${p.nombre}`} width={240} height={240} loading="lazy" />
        ) : (
          <span aria-hidden>{initials(p.nombre)}</span>
        )}
      </div>
      <div className="eq-id">
        <p className="eq-name">{p.nombre}</p>
        {p.estudia ? (
          <p className="eq-line">
            <span>estudia</span> {p.estudia}
          </p>
        ) : null}
        {p.trabaja ? (
          <p className="eq-line">
            <span>trabaja</span> {p.trabaja}
          </p>
        ) : null}
      </div>
      {p.link ? (
        <a className="eq-contact" href={p.link} target="_blank" rel="noopener noreferrer" aria-label={`${p.nombre} en ${linkedin ? "LinkedIn" : "la web"}`}>
          {linkedin ? <LinkedInIcon /> : <span aria-hidden>↗</span>}
        </a>
      ) : null}
    </li>
  );
}
