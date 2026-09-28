import type { Metadata } from "next";
import { SignupPaths } from "../components/SignupPaths";
import { APPLY_DEADLINE, APPLY_OPEN, APPLY_URL, PARTICIPANTS_EMAIL } from "../event";

export const metadata: Metadata = {
  alternates: { canonical: APPLY_URL },
};

export default function InscripcionPage() {
  return (
    <div className="wrap flow">
      <div className="flow-context">
        <p className="eyebrow">// {APPLY_OPEN ? "inscripciones abiertas" : "inscripciones"}</p>
        <h1 className="flow-title">tu próximo build empieza acá.</h1>
        <p className="flow-intro">
          {APPLY_OPEN
            ? `Fecha límite: ${APPLY_DEADLINE}. Elegí cómo venís: con equipo o buscando uno.`
            : "Equipos de 3, gratis y con cupos limitados."}
        </p>
      </div>
      <div className="flow-main">
        <SignupPaths />
      </div>
      <div className="flow-aside">
        <p>¿Preferís hablar primero?</p>
        <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-strong">
          hablá con Ramiro ↗
        </a>
      </div>
    </div>
  );
}
