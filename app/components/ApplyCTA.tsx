import { InscribiteBtn } from "./DeployFX";
import {
  APPLY_DEADLINE,
  APPLY_OPEN,
  APPLY_SOON_HEADLINE,
  APPLY_SOON_NOTE,
} from "../event";

/** Bloque de inscripción: lleva a la postulación.
 *  Mientras APPLY_OPEN sea false anuncia que las inscripciones abren pronto. */
export function ApplyCTA() {
  if (!APPLY_OPEN) {
    return (
      <div className="apply-cta">
        <p className="apply-soon-line">
          <span className="slash">//</span> {APPLY_SOON_HEADLINE}
        </p>
        <p className="note">{APPLY_SOON_NOTE}</p>
      </div>
    );
  }

  return (
    <div className="apply-cta">
      <InscribiteBtn className="btn">aplicar →</InscribiteBtn>
      <p className="note">
        inscripciones hasta el {APPLY_DEADLINE} · cupos limitados.
      </p>
    </div>
  );
}
