import { GlyphField } from "./GlyphField";
import { Reveal } from "./Reveal";
import { APPLY_OPEN, TEAMS_TOTAL } from "../event";

const STEPS = [
  {
    n: "01",
    t: APPLY_OPEN ? "armá tu equipo" : "armaron su equipo",
    d: APPLY_OPEN
      ? "Equipos de 3. Si todavía te faltan compañeros, podés inscribirte igual."
      : `${TEAMS_TOTAL} equipos de 3.`,
  },
  {
    n: "02",
    t: APPLY_OPEN ? "construí un producto de IA" : "construyeron un producto de IA",
    d: APPLY_OPEN
      ? "Elegí un problema y llevá una idea a un producto que haga trabajo real."
      : "De una idea a un producto que hace trabajo real.",
  },
  {
    n: "03",
    t: APPLY_OPEN ? "pitchealo en vivo" : "lo pitchearon en vivo",
    d: APPLY_OPEN
      ? "Cerrá el fin de semana pitcheando tu producto funcionando frente al jurado."
      : "Cerraron el domingo con el producto funcionando frente al jurado.",
  },
];

export function EventSection() {
  return (
    <section id="evento" className="section">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">// el evento</p>
          <div className="event-head">
            <div>
              <h2 className="h2">
                no alcanza con usar IA.
                <br />
                construí un producto de IA.
              </h2>
              <p className="lede">
                Un fin de semana presencial construyendo en la vanguardia de la
                tecnología: de una idea a un producto de IA funcionando.
              </p>
            </div>
            <div className="event-glyph-cell">
              <GlyphField className="event-glyph" lines={["IA"]} label="IA, escrito con ceros y unos" />
            </div>
          </div>
        </Reveal>
        <ol className="steps cells">
          {STEPS.map((s) => (
            <li key={s.n}>
              <Reveal className="step">
                <span className="step-n">{s.n}</span>
                <h3 className="h3">{s.t}</h3>
                <p>{s.d}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
