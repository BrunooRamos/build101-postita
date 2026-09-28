import { GlyphField } from "./GlyphField";
import { Reveal } from "./Reveal";

const STEPS = [
  {
    n: "01",
    t: "armá tu equipo",
    d: "Equipos de 3. Si todavía te faltan compañeros, podés inscribirte igual.",
  },
  {
    n: "02",
    t: "construí un producto de IA",
    d: "Elegí un problema y llevá una idea a un producto que haga trabajo real.",
  },
  {
    n: "03",
    t: "pitchealo en vivo",
    d: "Cerrá el fin de semana pitcheando tu producto funcionando frente al jurado.",
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
                Un fin de semana presencial para construir en la vanguardia de la
                tecnología: de una idea a un producto de IA funcionando.
              </p>
            </div>
            <GlyphField className="event-glyph" lines={["IA"]} label="IA, escrito con ceros y unos" />
          </div>
        </Reveal>
        <ol className="steps">
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
