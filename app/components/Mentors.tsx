import type { CSSProperties } from "react";
import { Reveal } from "./Reveal";
import { PixelBlocks, PIXELS_SMALL } from "./PixelBlocks";
import { MENTORS_EMAIL } from "../event";

// TODO(build101): cuando se confirmen, reemplazar las filas "por anunciar"
// por nombre y rol (mismo patrón que la lista del equipo).
function TbaSlots({ count, label, noun }: { count: number; label: string; noun: string }) {
  return (
    <div className="tba">
      <p className="label">{label}</p>
      <ul className="tba-rows" aria-label="por anunciar">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="tba-row" style={{ "--i": i } as CSSProperties} aria-hidden>
            <span>
              {noun} {String(i + 1).padStart(2, "0")}
            </span>
            <span>por anunciar</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Mentors() {
  return (
    <section id="mentores" className="section">
      <div className="wrap people">
        <Reveal className="people-main">
          <p className="eyebrow">// mentores</p>
          <h2 className="h2">
            construir también
            <br />
            es aprender de otros.
          </h2>
          <p className="lede">
            Mentores que acompañan a los equipos durante todo el fin de semana.
            Pronto vamos a presentar a quienes se suman.
          </p>
          <TbaSlots count={5} label="mentores que te van a estar apoyando" noun="mentor" />
        </Reveal>
        <Reveal className="people-aside">
          <PixelBlocks id="px-mentors" cells={PIXELS_SMALL} cols={4} rows={4} className="aside-pixels" />
          <h3 className="h3">¿querés mentorear?</h3>
          <p>Bruno coordina a quienes quieren acompañar a los equipos.</p>
          <a href={`mailto:${MENTORS_EMAIL}`} className="btn btn-ghost btn-block">
            escribile a Bruno{" "}
            <span className="arr" aria-hidden>
              ↗
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Jury() {
  return (
    <section id="jurado" className="section section-rule">
      <div className="wrap people people-right">
        <Reveal className="people-main">
          <p className="eyebrow">// jurado</p>
          <h2 className="h2">
            evaluado por referentes
            <br />
            de la industria.
          </h2>
          <p className="lede">
            Fundadores, inversores y líderes de producto van a ver tu pitch y tu
            producto funcionando. Pronto anunciamos quiénes son.
          </p>
          <TbaSlots count={3} label="el jurado que va a evaluar tu producto" noun="jurado" />
        </Reveal>
      </div>
    </section>
  );
}
