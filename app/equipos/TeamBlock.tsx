import { LinkedInIcon } from "../components/Founders";
import { CopyLink } from "./CopyLink";
import { ShotBox } from "./ShotBox";
import { host, initials, placeLabel, result, slug, subtitle, title, type Builder, type Team } from "./data";

// Un equipo: número, producto y one-liner, captura del demo y los tres
// builders. Vive en la lista (/equipos#07, que es el link que se comparte) y
// también en la página propia (/equipos/07).
export function TeamBlock({ team, heading = "h2" }: { team: Team; heading?: "h1" | "h2" }) {
  const n = slug(team);
  const H = heading;
  const sub = subtitle(team);
  const place = result(team);
  // el video se reproduce en la ventanita; pitch y afiches quedan como link
  const videos = team.material.filter((m) => m.tipo === "video");
  const docs = team.material.filter((m) => m.tipo !== "video");
  return (
    <article id={n} className="eq-team" aria-labelledby={`eq-${n}`}>
      <header className="eq-head">
        <a href={`/equipos#${n}`} className="eq-num" aria-label={`equipo ${n}`}>
          {n}
        </a>
        <div className="eq-titles">
          <H id={`eq-${n}`} className="eq-title">
            {title(team)}
          </H>
          {sub || place ? (
            <p className="eq-sub">
              {place ? <span className={`eq-place ${place.puesto !== null && place.puesto <= 3 ? "eq-place-win" : ""}`}>{placeLabel(place.puesto)}</span> : null}
              {sub ? `// ${sub}` : null}
            </p>
          ) : null}
        </div>
        <CopyLink path={`/equipos#${n}`} label={title(team)} />
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
            {docs.map((m) => (
              <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer" className="eq-link">
                <span>$ ver</span> {m.tipo} ↗
              </a>
            ))}
          </div>
        </div>
        {team.captura ? (
          <ShotBox
            image={team.captura}
            label={shotLabel(team)}
            href={team.demo ?? docs[0]?.url ?? team.repos[0] ?? null}
            video={videos[0] ? videos[0].url.replace(/\/view$/, "/preview") : null}
            name={title(team)}
          />
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

/** Lo que dice la barrita de la ventana: de dónde sale la imagen. */
function shotLabel(team: Team) {
  if (team.demo) return host(team.demo);
  if (team.material.some((m) => m.tipo === "video")) return "video del equipo";
  if (team.material.length) return `${team.material[0].tipo} del equipo`;
  return team.repos[0] ? host(team.repos[0]) : "";
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
        {p.aporte ? <p className="eq-aporte">$ {p.aporte}</p> : null}
      </div>
      {p.link ? (
        <a className="eq-contact" href={p.link} target="_blank" rel="noopener noreferrer" aria-label={`${p.nombre} en ${linkedin ? "LinkedIn" : "la web"}`}>
          {linkedin ? <LinkedInIcon /> : <span aria-hidden>↗</span>}
        </a>
      ) : null}
    </li>
  );
}
