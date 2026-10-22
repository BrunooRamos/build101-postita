import { Reveal } from "./Reveal";
import { PixelBlocks, PIXELS_SMALL } from "./PixelBlocks";
import { EVENT_START_DATE } from "../event";

// Post evento: reemplaza "fechas & lugar" y "qué te llevás". El after movie
// todavía no salió: el marco 16:9 queda como un player en espera.
export function Recap() {
  return (
    <section id="recap" className="section">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            // primera edición · <time dateTime={EVENT_START_DATE}>17—18 oct 2026</time>
          </p>
        </Reveal>

        <Reveal className="aftermovie">
          <PixelBlocks id="px-aftermovie" cells={PIXELS_SMALL} cols={4} rows={4} className="aftermovie-pixels" />
          <div className="aftermovie-center">
            <p className="label">after movie</p>
            <p className="aftermovie-soon">
              soon<span className="cursor" aria-hidden />
            </p>
          </div>
          <div className="aftermovie-bar" aria-hidden>
            <span className="aftermovie-play">▶</span>
            <span className="aftermovie-track" />
            <span>00:00 / --:--</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
