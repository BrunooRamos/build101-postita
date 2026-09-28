import { Reveal } from "./Reveal";
import { FAQS } from "../faqs";

export function FAQ() {
  return (
    <section id="faq" className="section">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">// preguntas frecuentes</p>
          <h2 className="h2">antes de sumarte.</h2>
        </Reveal>

        <Reveal className="faq">
          {FAQS.map((item, i) => (
            // name="faq": acordeón exclusivo nativo, abrir una cierra la anterior
            <details className="faq-item" name="faq" key={item.q} open={i === 1}>
              <summary>
                <span className="faq-n">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="faq-q">{item.q}</h3>
                <span className="faq-mark" aria-hidden />
              </summary>
              <div className="faq-a">{item.a ?? item.aText}</div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
