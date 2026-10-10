"use client";

import { useEffect, useState } from "react";
import { APPLY_DEADLINE_ISO, APPLY_OPEN, EVENT_END_ISO, EVENT_KICKOFF_ISO } from "../event";

const DEADLINE = Date.parse(APPLY_DEADLINE_ISO);
const KICKOFF = Date.parse(EVENT_KICKOFF_ISO);
const END = Date.parse(EVENT_END_ISO);

const pad = (n: number) => String(n).padStart(2, "0");

/** Qué se cuenta: primero el cierre de inscripciones, después el kickoff. */
function target(now: number): { label: string; at: number | null } {
  if (APPLY_OPEN && now < DEADLINE) return { label: "cierran las inscripciones", at: DEADLINE };
  if (now < KICKOFF) return { label: "arranca build 101", at: KICKOFF };
  return { label: "build 101", at: null };
}

function format(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${pad(d)}D.${pad(h)}H.${pad(m)}M.${pad(s % 60)}S`;
}

/** Cuenta regresiva estilo Ship ("12D.20H.41M.07S"). En el server y en el
 *  primer render muestra guiones, así el HTML no depende de la hora. */
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const t = target(now ?? 0);
  const live = now !== null && t.at === null && now < END;
  const value =
    now === null ? "--D.--H.--M.--S" : t.at !== null ? format(t.at - now) : live ? "en vivo" : "gracias por venir";

  // se usa dentro de un <dl>: el par dt/dd lo pone este componente.
  return (
    <>
      <dt>{now === null ? (APPLY_OPEN ? "cierran las inscripciones" : "arranca build 101") : t.label}</dt>
      <dd className="countdown">{value}</dd>
    </>
  );
}
