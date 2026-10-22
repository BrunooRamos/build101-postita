import { Reveal } from "./Reveal";
import { LinkedInIcon } from "./Founders";
import { PixelBlocks, PIXELS_SMALL } from "./PixelBlocks";
import { JURY } from "../event";

// Mismas celdas que el equipo (Founders.tsx): foto en halftone, datos en mono
// y, al pasar el mouse o con foco, la celda sube y se enciende mientras las
// demás se atenúan. Son 12: llenan la grilla justa de a 4, 3 o 2 por fila.
export function Jury() {
  return (
    <section id="jurado" className="section section-rule">
      <div className="wrap">
        <Reveal className="founders-head">
          <div>
            <p className="eyebrow">// jurado</p>
            <h2 className="h2">
              evaluado por referentes
              <br />
              de la industria.
            </h2>
          </div>
          <p className="founders-aside">
            Fundadores, inversores y líderes de producto
            <br />
            vieron cada pitch y cada producto funcionando.
          </p>
        </Reveal>

        <Reveal>
          <ul className="team jury">
            {JURY.map((p, i) => (
              <li key={p.key} className="member">
                <div className="member-photo halftone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={`foto de ${p.name}`} width={360} height={360} loading="lazy" />
                  <PixelBlocks id={`px-jury-${i}`} cells={PIXELS_SMALL} cols={4} rows={4} className="member-pixels" />
                </div>
                <div className="member-id">
                  <div className="member-top">
                    <div>
                      <p className="member-name">{p.name}</p>
                      <p className="member-role">{p.role}</p>
                    </div>
                    {p.linkedin ? (
                      <a
                        className="member-link"
                        href={p.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${p.name} en LinkedIn`}
                      >
                        <LinkedInIcon />
                      </a>
                    ) : null}
                  </div>
                  {p.note ? <p className="member-orgs">{p.note}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
