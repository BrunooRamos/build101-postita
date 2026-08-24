import { InscribiteBtn } from "./DeployFX";
import { Terminal } from "./Terminal";
import { EVENT_DATES, EVENT_START_DATE } from "../event";

export function Hero() {
  return (
    <header className="hero" id="init">
      <div className="wrap hero-main">
        <div className="hero-copy">
          {/* El kicker vive dentro del h1: el heading principal nombra la
              entidad (hackathon + Uruguay) para buscadores y answer engines. */}
          <h1 className="hero-h1">
            <span className="hero-kicker rise">
              la hackathon de ia más grande de uruguay.
            </span>
            <span className="hero-h1-main rise d1">
              <em className="h1-accent">zero to product</em> en 36 horas.
            </span>
          </h1>
          <p className="lead hero-lead rise d2">
            armás un equipo de 3, construís un producto real y lo mostrás
            funcionando el domingo. inscribí a tu equipo: gratis y con cupos
            limitados.
          </p>
          <div className="hero-cta rise d3">
            <InscribiteBtn className="btn">aplicar →</InscribiteBtn>
            <a href="#build" className="btn btn-ghost">
              ver el programa
            </a>
          </div>
          <div className="hero-meta rise d4">
            <div className="meta-item">
              <span className="meta-k">cuándo</span>
              <time className="meta-v" dateTime={EVENT_START_DATE}>
                {EVENT_DATES}
              </time>
            </div>
            <span className="meta-sep" aria-hidden />
            <div className="meta-item">
              <span className="meta-k">dónde</span>
              <span className="meta-v">universidad de montevideo - latu</span>
            </div>
          </div>
        </div>

        <div className="hero-term rise d2">
          <Terminal />
          <div className="hero-coorg">
            <span className="coorg-label">co-organizado por</span>
            <a
              href="https://um.edu.uy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Universidad de Montevideo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sponsors/um.svg"
                alt="Universidad de Montevideo"
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
