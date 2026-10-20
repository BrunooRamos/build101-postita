import Link from "next/link";
import { Logo } from "./Logo";
import { ShareLinks } from "./ShareLinks";
import { FooterSocials, NavSocials } from "./Socials";
import { TEAM } from "../event";

const AREA_LABEL = { participants: "participants", mentors: "mentors", sponsors: "sponsors" } as const;

/** La nav del sitio. En /equipos va con `page="equipos"`: el botón pasa a
 *  ser "volver al sitio". */
export function SiteNav({ page }: { page?: "equipos" } = {}) {
  return (
    <nav className="topnav" aria-label="principal">
      <div className="wrap topnav-inner">
        <Link href="/" aria-label="build 101, inicio">
          <Logo />
        </Link>
        <div className="nav-links">
          <Link href="/#evento">el evento</Link>
          <Link href="/#cronograma">fechas &amp; lugar</Link>
          <Link href="/#sponsors">sponsors</Link>
          <Link href="/#contacto">contacto</Link>
        </div>
        <div className="topnav-end">
          <NavSocials />
          {page === "equipos" ? (
            <Link href="/" className="btn btn-primary btn-sm">
              ← volver al sitio
            </Link>
          ) : (
            <Link href="/equipos" className="btn btn-primary btn-sm">
              ver los equipos →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/** Nav mínima de las pantallas de inscripción: logo + volver. */
export function FlowNav() {
  return (
    <nav className="topnav" aria-label="principal">
      <div className="wrap topnav-inner">
        <Link href="/" aria-label="build 101, inicio">
          <Logo />
        </Link>
        <Link href="/" className="link-quiet">
          ← volver al sitio
        </Link>
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer" id="contacto">
      <div className="wrap">
        <div className="footer-top">
          <div>
            <Logo className="footer-logo" />
            <p className="footer-tagline">build. ship. repeat.</p>
            <FooterSocials />
          </div>
          <ul className="footer-contacts">
            {TEAM.map((p) => (
              <li key={p.key}>
                <p className="label">{AREA_LABEL[p.area]}</p>
                <p className="footer-name">{p.name}</p>
                <a href={`mailto:${p.email}`}>{p.email} ↗</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-bottom">
          <span>© 2026 build 101 · Montevideo, Uruguay</span>
          <ShareLinks />
        </div>
      </div>
    </footer>
  );
}
