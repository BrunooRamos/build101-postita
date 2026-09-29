import { Reveal } from "./Reveal";

// "qué te llevás": un ticket donde todo viene incluido y el total da $0.
const LINES = [
  { item: "entrada", price: "$0" },
  { item: "tools y créditos", price: "incluido" },
  { item: "comida", price: "incluido" },
  { item: "merch", price: "incluido" },
  { item: "premios", price: "para los mejores" },
];

export function Perks() {
  return (
    <section id="beneficios" className="section">
      <div className="wrap receipt-wrap">
        <Reveal className="receipt-copy">
          <p className="eyebrow">// qué te llevás</p>
          <h2 className="h2">
            vos ponés las ganas.
            <br />
            nosotros, el resto.
          </h2>
          <p className="lede">
            Participar es gratis. Tools, créditos, comida, merch y premios corren
            por nuestra cuenta.
          </p>
        </Reveal>
        <Reveal className="receipt">
          <div className="receipt-head">
            <span>build 101</span>
            <span>17—18 oct</span>
          </div>
          <ul className="receipt-lines">
            {LINES.map((l) => (
              <li key={l.item}>
                <span>{l.item}</span>
                <span className="receipt-dots" aria-hidden />
                <span className="receipt-price">{l.price}</span>
              </li>
            ))}
          </ul>
          <div className="receipt-total">
            <span>total</span>
            <span className="receipt-sum">$0</span>
          </div>
          <p className="receipt-foot">* cupos limitados</p>
        </Reveal>
      </div>
    </section>
  );
}
