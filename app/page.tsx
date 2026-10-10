import { Reveal } from "./components/Reveal";
import { ScrollProgress } from "./components/ScrollProgress";
import { Hero } from "./components/Hero";
import { EventSection } from "./components/EventSection";
import { Schedule } from "./components/Schedule";
import { Perks } from "./components/Perks";
import { Founders } from "./components/Founders";
import { Sponsors } from "./components/Sponsors";
import { Mentors, Jury } from "./components/Mentors";
import { FAQ } from "./components/FAQ";
import { SignupPaths } from "./components/SignupPaths";
import { SiteFooter, SiteNav } from "./components/SiteChrome";
import { FollowSection } from "./components/Socials";
import { KonamiMatrix } from "./components/KonamiMatrix";
import { DeployFX } from "./components/DeployFX";
import { FakeCrash } from "./components/FakeCrash";
import { StructuredData } from "./components/StructuredData";
import { APPLY_CLOSED_MESSAGE, APPLY_DEADLINE_FULL, APPLY_OPEN, APPLY_SELECTION_MESSAGE, PARTICIPANTS_EMAIL } from "./event";

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
        <Perks />
        <Sponsors />
        <Founders />
        <Mentors />
        <Jury />
        <FAQ />

        {/* ============ INSCRIPCIÓN ============ */}
        <section id="inscripcion" className="section">
          <div className="wrap signup">
            <Reveal className="signup-copy">
              <p className="eyebrow">// {APPLY_OPEN ? "inscripciones abiertas" : "inscripciones cerradas"}</p>
              <h2 className="h2 h2-lg">
                {APPLY_OPEN ? <>tu próximo build<br />empieza acá.</> : "gracias por sumarte."}
              </h2>
              <p className="lede lede-strong">
                {APPLY_OPEN ? (
                  <>
                    Fecha límite: {APPLY_DEADLINE_FULL}.
                    <br />
                    Elegí cómo venís: con equipo o buscando uno.
                  </>
                ) : (
                  APPLY_CLOSED_MESSAGE
                )}
              </p>
              <p className="fine">
                {APPLY_OPEN
                  ? "Inscribirte no garantiza un lugar. La participación queda sujeta a selección y confirmación del equipo."
                  : APPLY_SELECTION_MESSAGE}
              </p>
            </Reveal>
            <Reveal className="signup-paths">
              <SignupPaths />
            </Reveal>
            <Reveal className="signup-talk">
              <p className="h4">¿tenés alguna duda?</p>
              <p>Ramiro te ayuda con tus dudas sobre la participación.</p>
              <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-strong">
                hablá con Ramiro ↗
              </a>
            </Reveal>
          </div>
        </section>

        <FollowSection />
      </main>

      <SiteFooter />
    </>
  );
}
