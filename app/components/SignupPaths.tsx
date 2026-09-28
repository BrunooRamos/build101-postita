import Link from "next/link";
import { APPLY_OPEN, APPLY_PATH } from "../event";

const PATHS = [
  {
    href: `${APPLY_PATH}/equipo`,
    n: "01",
    t: "ya tenemos equipo.",
    d: "Inscribí a tu equipo de 3. Vos quedás como contacto.",
    primary: true,
  },
  {
    href: `${APPLY_PATH}/solo`,
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
        <p className="paths-soon">// pronto se anuncian las inscripciones.</p>
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
                <span className="path-title">{p.t}</span>
                <span className="path-desc">{p.d}</span>
              </span>
              <span className={`path-go ${p.primary ? "primary" : ""}`} aria-hidden>
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="fine">Un formulario corto: tus datos y cómo usás IA hoy.</p>
    </div>
  );
}
