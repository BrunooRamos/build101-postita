import Link from "next/link";
import { Terminal } from "./Terminal";
import { Countdown } from "./Countdown";
import { PixelBlocks, PIXELS_HERO } from "./PixelBlocks";
import {
  APPLY_DEADLINE_FULL,
  APPLY_OPEN,
  EVENT_DATES,
  EVENT_START_DATE,
  TEAMS_TOTAL,
  VENUE_SHORT,
} from "../event";

export function Hero() {
  return (
    <header className="hero" id="top">
      <div className="wrap">
        <p className="hero-badge rise">
          <span className="badge">{APPLY_OPEN ? "abiertas" : "primera edición"}</span>
          {APPLY_OPEN
            ? `inscripciones hasta el ${APPLY_DEADLINE_FULL.replace(/ /g, "\u00a0")}`
            : `17 y 18 oct 2026 · ${TEAMS_TOTAL} equipos`}
        </p>

        {/* coorganizan arriba de todo, logos centrados: se ve apenas carga, en cualquier pantalla */}
        <div className="coorg rise">
          <p className="sr-only">coorganizan</p>
          <ul className="coorg-logos">
            <li>
              <a
                href="https://um.edu.uy"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Universidad de Montevideo · Facultad de Ingeniería"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="coorg-um" src="/sponsors/um-fium-white.png" alt="Universidad de Montevideo · Facultad de Ingeniería (FIUM)" width={416} height={96} />
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

        <div className="hero-frame rise d1">
          <div className="hero-copy">
            <h1 className="hero-title">
              construimos <br />
              lo que viene.
              <br />
              en un fin <br className="br-m" />
              de semana.
            </h1>
            <p className="hero-lede">
              La hackathon de IA más grande de Uruguay.
              <br />
              {TEAMS_TOTAL} equipos construyeron un producto de IA y lo pitchearon en vivo.
            </p>
            <div className="hero-cta">
              <Link href="/equipos" className="btn btn-primary">
                ver los equipos →
              </Link>
              <a href="#redes" className="link-quiet">
                seguinos para lo que viene ↗
              </a>
            </div>
            {APPLY_OPEN ? (
              <p className="fine">
                Inscribirte no garantiza un lugar.
                <br />
                La participación queda sujeta a selección y confirmación del equipo.
              </p>
            ) : null}
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
            <dt>primera edición</dt>
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
      </div>
    </header>
  );
}
