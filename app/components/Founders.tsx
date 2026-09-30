"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import { PixelBlocks, PIXELS_TEAM } from "./PixelBlocks";
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

// Patrón "featured speakers" de Vercel Ship: lista con hairlines a la
// izquierda y una foto grande a la derecha que sigue al hover/focus.
export function Founders() {
  const [active, setActive] = useState(0);

  return (
    <section id="equipo" className="section">
      <div className="wrap">
        <Reveal className="founders-head">
          <div>
            <p className="eyebrow">// el equipo</p>
            <h2 className="h2">
              no solo organizamos.
              <br />
              también construimos.
            </h2>
          </div>
          <p className="founders-aside">
            Somos Ramiro, Bruno y Mateo.
            <br />
            Construimos productos de IA todos los días.
          </p>
        </Reveal>

        <Reveal className="speakers">
          <ul className="speaker-list">
            {TEAM.map((p, i) => (
              <li
                key={p.key}
                className="speaker"
                data-active={i === active || undefined}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="speaker-thumb" src={p.photo} alt="" width={72} height={72} loading="lazy" />
                <div className="speaker-id">
                  <p className="speaker-name">{p.name}</p>
                  <p className="speaker-role">{p.role}</p>
                  <p className="speaker-orgs">
                    {/* como en LinkedIn: primero dónde trabaja, después dónde estudia */}
                    {p.work.detail} · {p.work.name}
                    <br />
                    {p.school.detail} · {p.school.name}
                  </p>
                </div>
                <a
                  className="speaker-link"
                  href={p.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${p.name} en LinkedIn`}
                >
                  <LinkedInIcon />
                </a>
              </li>
            ))}
          </ul>
          <div className="speaker-photo halftone" aria-hidden>
            {TEAM.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.key}
                src={p.photo}
                alt=""
                width={360}
                height={360}
                loading="lazy"
                data-active={i === active || undefined}
              />
            ))}
            <PixelBlocks id="px-team" cells={PIXELS_TEAM} className="speaker-pixels" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
