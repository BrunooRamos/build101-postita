import { Reveal } from "./Reveal";
import { SOCIALS } from "../event";

type SocialKey = (typeof SOCIALS)[number]["key"];

/** Íconos de línea (trazo 1.8, esquinas redondeadas) para que pesen igual que
 *  el resto de la UI. Toman el color del texto. */
export function SocialIcon({ k, size = 20 }: { k: SocialKey; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;
  if (k === "instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (k === "x") {
    return (
      <svg {...common}>
        <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          fill="currentColor"
          transform="translate(6 6) scale(0.5)"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        fill="currentColor"
        d="M7.3 10.2h2.2v6.9H7.3zM8.4 6.7a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6zM11.1 10.2h2.1v.95c.35-.66 1.2-1.15 2.35-1.15 2 0 2.75 1.25 2.75 3.25v3.85h-2.2v-3.4c0-.95-.2-1.75-1.2-1.75s-1.6.75-1.6 1.75v3.4h-2.2z"
      />
    </svg>
  );
}

/** Íconos de la barra de arriba. */
export function NavSocials() {
  return (
    <ul className="nav-socials" aria-label="redes">
      {SOCIALS.map((s) => (
        <li key={s.key}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`build 101 en ${s.label}`}>
            <SocialIcon k={s.key} />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Links del footer: ícono + nombre de la red. */
export function FooterSocials() {
  return (
    <ul className="footer-socials" aria-label="redes">
      {SOCIALS.map((s) => (
        <li key={s.key}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`build 101 en ${s.label}`}>
            <SocialIcon k={s.key} size={18} />
            {s.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Cierre de la página: CTA a seguir las redes. */
export function FollowSection() {
  return (
    <section id="redes" className="section">
      <div className="wrap follow">
        <Reveal className="follow-copy">
          <p className="eyebrow">// seguinos</p>
          <h2 className="h2">
            seguinos en
            <br />
            todas las redes.
          </h2>
          <p className="lede">Mentores, jurado y novedades del evento, primero ahí.</p>
        </Reveal>
        <Reveal className="follow-links">
          <ul>
            {SOCIALS.map((s) => (
              <li key={s.key}>
                <a className="follow-link" href={s.url} target="_blank" rel="noopener noreferrer">
                  <span className="follow-icon">
                    <SocialIcon k={s.key} size={26} />
                  </span>
                  <span className="follow-text">
                    <span className="follow-name">{s.label}</span>
                    <span className="follow-handle">{s.handle}</span>
                  </span>
                  <span className="arr" aria-hidden>
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
