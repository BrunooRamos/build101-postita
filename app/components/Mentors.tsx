import { Reveal } from "./Reveal";
import { PixelBlocks, PIXELS_SMALL } from "./PixelBlocks";
import { MENTORS_DESCRIPTION, MENTORS_EMAIL } from "../event";

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
          <p className="lede">{MENTORS_DESCRIPTION}</p>
        </Reveal>
        <Reveal className="people-aside">
          <PixelBlocks id="px-mentors" cells={PIXELS_SMALL} cols={4} rows={4} className="aside-pixels" />
          <h3 className="h3">querés ser mentor en la próxima?</h3>
          <p>Bruno coordina las mentorías.</p>
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
