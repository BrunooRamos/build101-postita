import { InscribiteBtn } from "./DeployFX";
import { Terminal } from "./Terminal";
import { Countdown } from "./Countdown";
import { PixelBlocks, PIXELS_HERO } from "./PixelBlocks";
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
        <p className="hero-badge rise">
          <span className="badge">{APPLY_OPEN ? "abiertas" : "pronto"}</span>
          {APPLY_OPEN
            ? `inscripciones hasta el ${APPLY_DEADLINE_FULL.replace(/ /g, "\u00a0")}`
            : "las inscripciones abren pronto"}
        </p>

        <div className="hero-frame rise d1">
          <div className="hero-copy">
            <h1 className="hero-title">
              construí <br className="br-m" />
              lo que viene.
              <br />
              en un fin <br className="br-m" />
              de semana.
            </h1>
            <p className="hero-lede">
              La hackathon de IA más grande de Uruguay.
              <br />
              Armá tu equipo. Construí un producto de IA. Pitchealo en vivo.
            </p>
            <div className="hero-cta">
              <InscribiteBtn className="btn btn-primary">quiero participar →</InscribiteBtn>
              <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-quiet">
                o hablá con Ramiro ↗
              </a>
            </div>
            <p className="fine">
              Inscribirte no garantiza un lugar.
              <br />
              La participación queda sujeta a selección y confirmación del equipo.
            </p>
          </div>

          <div className="hero-side">
            <PixelBlocks id="px-hero" cells={PIXELS_HERO} className="hero-pixels" />
            <div className="hero-card">
              <Terminal />
            </div>
          </div>
        </div>

        <dl className="hero-meta rise d2">
          <div>
            <dt>fechas</dt>
            <dd>
              <time dateTime={EVENT_START_DATE}>{EVENT_DATES}</time>
            </dd>
          </div>
          <div>
            <dt>sede</dt>
            <dd>
              Universidad de Montevideo
              <br />
              {VENUE_SHORT} · presencial
            </dd>
          </div>
          <div>
            <Countdown />
          </div>
        </dl>

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
