import { InscribiteBtn } from "./DeployFX";
import { Terminal } from "./Terminal";
import {
  APPLY_DEADLINE_FULL,
  APPLY_OPEN,
  EVENT_DATES,
  EVENT_START_DATE,
  PARTICIPANTS_EMAIL,
  VENUE_SHORT,
} from "../event";

export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap">
        <p className="hero-status rise">
          <span className="status-dot" aria-hidden />
          {APPLY_OPEN
            ? `inscripciones abiertas · fecha límite: ${APPLY_DEADLINE_FULL}`
            : "inscripciones pronto"}
        </p>

        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="hero-title rise d1">
              construí <br className="br-m" />
              lo que viene.
              <br />
              en un fin <br className="br-m" />
              de semana.
            </h1>
            <p className="hero-lede rise d2">
              La hackathon de IA más grande de Uruguay.
              <br />
              Armá tu equipo. Construí un producto de IA. Pitchealo en vivo.
            </p>
            <div className="hero-cta rise d3">
              <InscribiteBtn className="btn btn-primary">quiero participar ↗</InscribiteBtn>
              <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-quiet">
                o hablá con Ramiro ↗
              </a>
            </div>
            <p className="fine rise d4">
              Inscribirte no garantiza un lugar.
              <br />
              La participación queda sujeta a selección y confirmación del equipo.
            </p>
          </div>

          <div className="hero-card rise d2">
            <Terminal
              footer={
                <div className="hero-card-meta">
                  <time className="hero-card-date" dateTime={EVENT_START_DATE}>
                    {EVENT_DATES}
                  </time>
                  <p>
                    Universidad de Montevideo
                    <br />
                    {VENUE_SHORT} · presencial
                  </p>
                </div>
              }
            />
          </div>
        </div>

        <div className="coorg">
          <p className="label">coorganizan</p>
          <ul className="coorg-logos">
            <li>
              <a
                href="https://um.edu.uy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Universidad de Montevideo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="coorg-um" src="/sponsors/um-white.png" alt="Universidad de Montevideo" width={131} height={52} />
              </a>
            </li>
            <li aria-hidden className="coorg-sep" />
            <li>
              <span className="coorg-b101" aria-label="build 101">
                build 101
              </span>
            </li>
            <li aria-hidden className="coorg-sep" />
            <li>
              <a href="https://canalmutuo.com" target="_blank" rel="noopener noreferrer" aria-label="MÜTÜÖ">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="coorg-mutuo" src="/sponsors/mutuo.png" alt="MÜTÜÖ" width={152} height={42} />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
