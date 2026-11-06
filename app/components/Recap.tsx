import { Reveal } from "./Reveal";
import { AFTERMOVIE, EVENT_START_DATE } from "../event";

// Post evento: reemplaza "fechas & lugar" y "qué te llevás". El after movie se
// sirve desde public/aftermovie (~49 MB): con preload="none" no se baja nada
// hasta que alguien le da play; mientras tanto se ve el póster (la foto grupal
// del cierre).
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
          <video
            className="aftermovie-video"
            src={AFTERMOVIE.src}
            poster={AFTERMOVIE.poster}
            controls
            playsInline
            preload="none"
            width={1920}
            height={1080}
            aria-label="after movie de build 101"
          />
        </Reveal>
      </div>
    </section>
  );
}
