import { Reveal } from "./Reveal";
import { AftermovieVideo } from "./AftermovieVideo";
import { EVENT_START_DATE } from "../event";

// Post evento: reemplaza "fechas & lugar" y "qué te llevás". El after movie se
// sirve desde public/aftermovie (~49 MB) y arranca en silencio cuando entra en
// pantalla (ver AftermovieVideo); hasta entonces se ve el póster (la foto
// grupal del cierre).
export function Recap() {
  return (
    <section id="recap" className="section">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            // after movie · primera edición · <time dateTime={EVENT_START_DATE}>17—18 oct 2026</time>
          </p>
        </Reveal>

        <Reveal className="aftermovie">
          <AftermovieVideo />
        </Reveal>
      </div>
    </section>
  );
}
