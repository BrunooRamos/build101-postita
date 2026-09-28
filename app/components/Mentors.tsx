import { Reveal } from "./Reveal";
import { MENTORS_EMAIL } from "../event";

// TODO(build101): cuando se confirmen, reemplazar los TBA por foto, nombre y rol.
function TbaSlots({ count, label }: { count: number; label: string }) {
  return (
    <div className="tba">
      <p className="label">{label}</p>
      <ul className="tba-slots" aria-label="por anunciar">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="tba-slot" aria-hidden>
            TBA
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
          <TbaSlots count={5} label="mentores que te van a estar apoyando" />
        </Reveal>
        <Reveal className="people-aside">
          <h3 className="h3">¿querés mentorear?</h3>
          <p>Bruno coordina a quienes quieren acompañar a los equipos.</p>
          <a href={`mailto:${MENTORS_EMAIL}`} className="btn btn-ghost btn-block">
            escribile a Bruno ↗
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Jury() {
  return (
    <section id="jurado" className="section section-rule">
      <div className="wrap people">
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
          <TbaSlots count={3} label="el jurado que va a evaluar tu producto" />
        </Reveal>
      </div>
    </section>
  );
}
