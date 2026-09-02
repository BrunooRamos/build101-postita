import { Logo } from "./components/Logo";
import { Reveal } from "./components/Reveal";
import { ScrollProgress } from "./components/ScrollProgress";
import { Hero } from "./components/Hero";
import { Sponsors } from "./components/Sponsors";
import { Consigna } from "./components/Consigna";
import { Mentors } from "./components/Mentors";
import { FAQ } from "./components/FAQ";
import { ApplyCTA } from "./components/ApplyCTA";
import { Countdown } from "./components/Countdown";
import { KonamiMatrix } from "./components/KonamiMatrix";
import { DeployFX, InscribiteBtn } from "./components/DeployFX";
import { FakeCrash } from "./components/FakeCrash";
import { StructuredData } from "./components/StructuredData";
import { SedeCarousel } from "./components/SedeCarousel";
import {
  APPLY_OPEN,
  VENUE,
  VENUE_ADDRESS,
  VENUE_MAPS,
  EVENT_DATES,
  EVENT_START_DATE,
  TEAM_EMAILS,
} from "./event";

// Cronograma detallado a publicar — por ahora, solo los horarios confirmados
// de la sede (no se pernocta: cierra de noche).
const AGENDA = [
  {
    d: "sáb 17 · 08:00 → 22:00",
    t: "kickoff & build",
    s: "acreditación, consigna y build durante todo el día. la sede cierra a las 22:00.",
  },
  {
    d: "dom 18 · 08:00 → 20:00",
    t: "último sprint, demos & premiación",
    s: "se retoma el build a la mañana. demos en vivo, jurado, premios y cierre.",
  },
];

export default function Home() {
  return (
    <>
      <StructuredData />
      <ScrollProgress />
      <KonamiMatrix />
      <DeployFX />
      <FakeCrash />

      {/* ============ NAV ============ */}
      <nav className="topnav">
        <div className="wrap">
          <a href="#top">
            <Logo coBrand />
          </a>
          <div className="nav-links">
            <div className="nav-secondary">
              <a href="#consigna">// consigna</a>
              <a href="#build">// programa</a>
              <a href="#faq">// faq</a>
            </div>
            <InscribiteBtn className="btn">aplicar →</InscribiteBtn>
          </div>
        </div>
      </nav>

      <span id="top" />

      {/* ============ HERO ============ */}
      <Hero />

      {/* ============ SPONSORS ============ */}
      <Sponsors />

      {/* ============ CONSIGNA ============ */}
      <Consigna />

      {/* ============ MENTORES & JURADO ============ */}
      <Mentors />

      {/* ============ PROGRAMA & LUGAR ============ */}
      <section id="build" className="section-rule">
        <div className="wrap">
          <Reveal>
            <div className="stage-head">
              <div className="eyebrow">
                <span className="slash">//</span> programa &amp; lugar
              </div>
              <h2>dos días a fondo.</h2>
              <p className="lead">
                sábado y domingo de build en la sede.{" "}
                <span className="comment">
                  // cronograma detallado a publicar antes del evento.
                </span>
              </p>
            </div>
          </Reveal>
          <Reveal>
            <SedeCarousel />
          </Reveal>
          <div className="agenda-grid">
            <Reveal>
              <div className="timeline-tba">
                <div className="timeline timeline-blur" aria-hidden="true">
                  {AGENDA.map((it) => (
                    <div className="tl-item" key={it.d}>
                      <div className="tl-date">{it.d}</div>
                      <div className="tl-body">
                        <b>{it.t}</b>
                        <span>{it.s}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="timeline-veil">
                  <span className="slash">//</span> cronograma por anunciarse
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="lugar">
                <div className="lugar-info">
                  <div className="eyebrow">
                    <span className="slash">//</span> lugar
                  </div>
                  <b>{VENUE}</b>
                  <span>{VENUE_ADDRESS}</span>
                  <a
                    href={VENUE_MAPS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lugar-map"
                  >
                    ver en el mapa →
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <FAQ />

      {/* ============ INSCRIPCIÓN ============ */}
      <section id="live" className="section-rule">
        <div className="wrap split2 inscripcion">
          <Reveal>
            <div className="eyebrow">
              <span className="slash">//</span> inscripción
            </div>
            <h2>buscamos builders.</h2>
            <p className="lead">
              {APPLY_OPEN
                ? "inscribí a tu equipo de 3 — gratis y con cupos limitados."
                : "equipos de 3, gratis y con cupos limitados."}
            </p>
            <div className="apply-meta">
              <div>
                <b>
                  <time dateTime={EVENT_START_DATE}>{EVENT_DATES}</time>
                </b>
                <span>// sábado a domingo</span>
              </div>
              <div>
                <b>36 horas</b>
                <span>// de cero a demo</span>
              </div>
              <div>
                <b>universidad de montevideo</b>
                <span>// latu</span>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="apply-box">
              <Countdown />
              <ApplyCTA />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ CLOSING BAND ============ */}
      <section className="closing-band">
        <div className="wrap">
          <p className="closing-line">construí. shippeá. repetí.</p>
          <p className="closing-sub">menos charla, más producto.</p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <Logo />
              <p className="foot-copy">
                zero to product en 36 horas —{" "}
                <time dateTime={EVENT_START_DATE}>{EVENT_DATES}</time>.
              </p>
              <p className="foot-copy" style={{ marginTop: 8 }}>
                <a href={VENUE_MAPS} target="_blank" rel="noopener noreferrer">
                  {VENUE} · {VENUE_ADDRESS}
                </a>
              </p>
              <div className="foot-coorg">
                <span className="foot-coorg-label">co-organizado por</span>
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
            <div className="foot-links">
              <div className="foot-col">
                <b>// evento</b>
                <a href="#consigna">consigna</a>
                <a href="#build">programa</a>
                <a href="#faq">faq</a>
              </div>
              <div className="foot-col">
                <b>// participá</b>
                <InscribiteBtn className="">aplicar</InscribiteBtn>
              </div>
              <div className="foot-col">
                <b>// contacto</b>
                {TEAM_EMAILS.map((email) => (
                  <a href={`mailto:${email}`} key={email}>
                    {email}
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 build 101 · montevideo, uruguay</span>
            <span>
              build: <span className="spark">stable</span>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
