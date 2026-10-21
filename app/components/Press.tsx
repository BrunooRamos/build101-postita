import Link from "next/link";
import { Reveal } from "./Reveal";
import { PRESS, formatPressDate, type PressItem } from "../press";

// Notas de prensa en celdas que comparten borde. `full` (en /prensa) lleva la
// foto en halftone y la bajada; la versión de la landing es solo tipográfica.
// Toda la celda es el link a la nota.
export function PressCards({ full = false }: { full?: boolean }) {
  return (
    <ul className={`press cells ${full ? "press-full" : ""}`}>
      {PRESS.map((p) => (
        <li key={p.key}>
          <PressCard item={p} full={full} />
        </li>
      ))}
    </ul>
  );
}

function PressCard({ item: p, full }: { item: PressItem; full: boolean }) {
  return (
    <a className="press-card" href={p.url} target="_blank" rel="noopener noreferrer">
      {full ? (
        <div className="press-photo halftone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt="" width={1200} height={675} loading="lazy" />
        </div>
      ) : null}
      <div className="press-body">
        <p className="label press-meta">
          <span className="label-strong">{p.outlet}</span> · {p.kind} ·{" "}
          <time dateTime={p.date}>{formatPressDate(p.date)}</time>
        </p>
        <h3 className="press-title">{p.title}</h3>
        {full && p.dek ? <p className="press-dek">{p.dek}</p> : null}
        {p.coorg ? <span className="badge press-coorg">coorganizador de build 101</span> : null}
        <span className="press-cta label">
          leer en {p.outlet} <span className="arr">↗</span>
        </span>
      </div>
    </a>
  );
}

/** Franja de la landing: las notas y el link a /prensa. */
export function PressSection() {
  return (
    <section id="prensa" className="section">
      <div className="wrap">
        <Reveal className="press-head">
          <div>
            <p className="eyebrow">// en los medios</p>
            <h2 className="h2">prensa.</h2>
          </div>
          <Link href="/prensa" className="btn btn-ghost">
            ver toda la prensa <span className="arr">→</span>
          </Link>
        </Reveal>
        <Reveal>
          <PressCards />
        </Reveal>
      </div>
    </section>
  );
}
