import { Reveal } from "./Reveal";
import { SedeCarousel } from "./SedeCarousel";
import { SCHEDULE, VENUE, VENUE_ADDRESS, VENUE_MAPS, EVENT_START_DATE } from "../event";

export function Schedule() {
  return (
    <section id="cronograma" className="section">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">// fechas &amp; lugar</p>
          <div className="schedule-head">
            <h2 className="h2">guardate el finde.</h2>
            <time className="schedule-date" dateTime={EVENT_START_DATE}>
              17 y 18 de octubre de 2026
            </time>
          </div>
        </Reveal>

        <div className="days cells">
          {SCHEDULE.map((d) => (
            <Reveal key={d.day} className="day">
              <p className="day-name">{d.day}</p>
              <p className="day-hours">{d.hours}</p>
              <p className="day-note">{d.note}</p>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <SedeCarousel />
        </Reveal>

        <Reveal className="venue">
          <div>
            <p className="venue-name">{VENUE}</p>
            <p className="venue-address">{VENUE_ADDRESS}</p>
          </div>
          <a href={VENUE_MAPS} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            ver cómo llegar{" "}
            <span className="arr" aria-hidden>
              ↗
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
