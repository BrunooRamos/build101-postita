import { Reveal } from "./components/Reveal";
import { ScrollProgress } from "./components/ScrollProgress";
import { Hero } from "./components/Hero";
import { EventSection } from "./components/EventSection";
import { Schedule } from "./components/Schedule";
import { Founders } from "./components/Founders";
import { Sponsors } from "./components/Sponsors";
import { Mentors, Jury } from "./components/Mentors";
import { FAQ } from "./components/FAQ";
import { SignupPaths } from "./components/SignupPaths";
import { SiteFooter, SiteNav } from "./components/SiteChrome";
import { KonamiMatrix } from "./components/KonamiMatrix";
import { DeployFX } from "./components/DeployFX";
import { FakeCrash } from "./components/FakeCrash";
import { StructuredData } from "./components/StructuredData";
import { APPLY_DEADLINE, APPLY_OPEN, PARTICIPANTS_EMAIL } from "./event";

export default function Home() {
  return (
    <>
      <StructuredData />
      <ScrollProgress />
      <KonamiMatrix />
      <DeployFX />
      <FakeCrash />

      <SiteNav />

      <main>
        <Hero />
        <EventSection />
        <Schedule />
        <Founders />
        <Sponsors />
        <Mentors />
        <Jury />
        <FAQ />

        {/* ============ INSCRIPCIÓN ============ */}
        <section id="inscripcion" className="section">
          <div className="wrap signup">
            <Reveal className="signup-copy">
              <p className="eyebrow">// {APPLY_OPEN ? "inscripciones abiertas" : "inscripciones"}</p>
              <h2 className="h2 h2-lg">
                tu próximo build
                <br />
                empieza acá.
              </h2>
              <p className="lede lede-strong">
                {APPLY_OPEN ? (
                  <>
                    Fecha límite: {APPLY_DEADLINE}.
                    <br />
                    Elegí cómo venís: con equipo o buscando uno.
                  </>
                ) : (
                  "Equipos de 3, gratis y con cupos limitados."
                )}
              </p>
              <p className="fine">
                Inscribirte no garantiza un lugar. La participación queda sujeta a
                selección y confirmación del equipo.
              </p>
            </Reveal>
            <Reveal className="signup-paths">
              <SignupPaths />
            </Reveal>
            <Reveal className="signup-talk">
              <p className="h4">¿preferís hablar primero?</p>
              <p>Ramiro te ayuda con la inscripción.</p>
              <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-strong">
                hablá con Ramiro ↗
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
