import type { Metadata } from "next";
import { SignupPaths } from "../components/SignupPaths";
import { APPLY_CLOSED_MESSAGE, APPLY_DEADLINE_FULL, APPLY_OPEN, APPLY_SELECTION_MESSAGE, APPLY_URL, PARTICIPANTS_EMAIL } from "../event";

export const metadata: Metadata = {
  alternates: { canonical: APPLY_URL },
};

export default function InscripcionPage() {
  return (
    <div className="wrap flow">
      <div className="flow-context">
        <p className="eyebrow">// {APPLY_OPEN ? "inscripciones abiertas" : "inscripciones cerradas"}</p>
        <h1 className="flow-title">{APPLY_OPEN ? "tu próximo build empieza acá." : "las inscripciones cerraron."}</h1>
        <p className="flow-intro">
          {APPLY_OPEN
            ? `Fecha límite: ${APPLY_DEADLINE_FULL}. Elegí cómo venís: con equipo o buscando uno.`
            : APPLY_CLOSED_MESSAGE}
        </p>
        {!APPLY_OPEN && <p className="fine">{APPLY_SELECTION_MESSAGE}</p>}
      </div>
      <div className="flow-main">
        <SignupPaths />
      </div>
      <div className="flow-aside">
        <p>¿Tenés alguna duda?</p>
        <a href={`mailto:${PARTICIPANTS_EMAIL}`} className="link-strong">
          hablá con Ramiro ↗
        </a>
      </div>
    </div>
  );
}
