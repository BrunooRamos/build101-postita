import { Reveal } from "./Reveal";
import { TEAM } from "../event";

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

function Org({ name, detail, logo }: { name: string; detail: string; logo: string }) {
  return (
    <li className="org">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} alt="" width={44} height={44} loading="lazy" />
      <div>
        <p className="org-name">{name}</p>
        <p className="org-detail">{detail}</p>
      </div>
    </li>
  );
}

export function Founders() {
  return (
    <section id="equipo" className="section section-paper">
      <div className="wrap">
        <Reveal className="founders-head">
          <h2 className="h2">
            no solo organizamos.
            <br />
            también construimos.
          </h2>
          <p className="founders-aside">
            Somos Ramiro, Bruno y Mateo.
            <br />
            Construimos productos de IA todos los días.
          </p>
        </Reveal>

        <ul className="founders">
          {TEAM.map((p) => (
            <li key={p.key}>
              <Reveal className="founder">
                <div className="founder-top">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="founder-photo"
                    src={p.photo}
                    alt={`foto de ${p.name}`}
                    width={104}
                    height={116}
                    loading="lazy"
                  />
                  <div className="founder-id">
                    <p className="label">{p.role}</p>
                    <a
                      className="founder-link"
                      href={p.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${p.name} en LinkedIn`}
                    >
                      <LinkedInIcon />
                      <span className="founder-name">{p.name}</span>
                      <span className="founder-arrow" aria-hidden>
                        ↗
                      </span>
                    </a>
                  </div>
                </div>
                <ul className="orgs">
                  <Org {...p.school} />
                  <Org {...p.work} />
                </ul>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
