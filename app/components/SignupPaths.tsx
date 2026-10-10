import Link from "next/link";
import { ViewTransition } from "react";
import { APPLY_CLOSED_LABEL, APPLY_OPEN, APPLY_PATH } from "../event";

const PATHS = [
  {
    href: `${APPLY_PATH}/equipo`,
    mode: "team",
    n: "01",
    t: "ya tenemos equipo.",
    d: "Inscribí a tu equipo de 3. Vos quedás como contacto.",
    primary: true,
  },
  {
    href: `${APPLY_PATH}/solo`,
    mode: "solo",
    n: "02",
    t: "busco equipo.",
    d: "Inscribite solo. Te ayudamos a encontrar con quién construir.",
    primary: false,
  },
];

/** Los dos caminos de inscripción: con equipo o buscando uno. */
export function SignupPaths() {
  if (!APPLY_OPEN) {
    return (
      <div className="paths">
        <p className="mono-line">$ build101 --join</p>
        <p className="paths-soon">// {APPLY_CLOSED_LABEL}.</p>
      </div>
    );
  }

  return (
    <div className="paths">
      <p className="mono-line" aria-hidden>
        $ build101 --join
      </p>
      <ul className="paths-list">
        {PATHS.map((p) => (
          <li key={p.href}>
            <Link href={p.href} className="path">
              <span className="path-n">{p.n}</span>
              <span className="path-body">
                {/* mismo name que el título del flujo (SignupFlow): al entrar,
                    esta tarjeta se transforma en el título de la página */}
                <ViewTransition name={`path-${p.mode}`} share="path-morph">
                  <span className="path-title">{p.t}</span>
                </ViewTransition>
                <span className="path-desc">{p.d}</span>
              </span>
              <span className={`path-go ${p.primary ? "primary" : ""}`} aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="fine">Un formulario corto: los datos de cada uno y por qué quieren venir.</p>
    </div>
  );
}
