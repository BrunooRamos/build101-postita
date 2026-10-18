"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FC } from "react";
import type { WrappedMetrics } from "@/lib/wrapped-types";
import * as C from "./cards";

// El loop para la tele: cada tarjeta dura ~9 s, cada 6 aparece la vista general
// y al terminar vuelve a empezar. En cada vuelta recarga /api/wrapped sin
// recargar la página; si falla, sigue con los últimos datos buenos.
//
// Teclas: espacio pausa · ← → anterior / siguiente · f pantalla completa.
// Para revisar una tarjeta: /wrapped?card=5&hold (arranca ahí y no avanza).

type M = WrappedMetrics;
type Slide = { id: string; dur: number; Card: FC<{ m: M; idx: number }>; ok?: (m: M) => boolean; numbered?: boolean };

const CARDS: Slide[] = [
  { id: "recibo", dur: 11, Card: C.Receipt },
  { id: "heatmap", dur: 10, Card: C.HeatCard, ok: (m) => m.heatmap.max > 0 },
  { id: "pico", dur: 8, Card: C.Peak, ok: (m) => Boolean(m.peak) },
  { id: "salida", dur: 8, Card: C.FastStart, ok: (m) => Boolean(m.fastStart) },
  { id: "buho", dur: 10, Card: C.Owl, ok: (m) => Boolean(m.owl) },
  { id: "madrugador", dur: 8, Card: C.EarlyBird, ok: (m) => Boolean(m.earlyBird) },
  { id: "durmieron", dur: 9, Card: C.Sleepless, ok: (m) => Boolean(m.sleepless) },
  { id: "ia", dur: 10, Card: C.AiShare, ok: (m) => m.ai.total > 0 },
  { id: "agentes", dur: 9, Card: C.Agents, ok: (m) => m.ai.byAgent.length > 1 },
  { id: "sdks", dur: 9, Card: C.Providers, ok: (m) => m.providers.length > 1 },
  { id: "modelos", dur: 9, Card: C.Models, ok: (m) => m.models.length > 1 },
  { id: "lenguajes", dur: 9, Card: C.Languages, ok: (m) => m.languages.length > 1 },
  { id: "stack", dur: 9, Card: C.Frameworks, ok: (m) => m.frameworks.length > 1 },
  { id: "monstruo", dur: 9, Card: C.Monster, ok: (m) => Boolean(m.monster) },
  { id: "palabras", dur: 10, Card: C.Words, ok: (m) => m.words.length >= 6 },
  { id: "contador", dur: 9, Card: C.Counters, ok: (m) => m.counters.some((c) => c.count > 0) },
  { id: "extremos", dur: 10, Card: C.Extremes, ok: (m) => Boolean(m.longest && m.shortest) },
  { id: "graciosos", dur: 14, Card: C.Funny, ok: (m) => m.funny.length >= 3 },
  { id: "equipos", dur: 10, Card: C.Teams, ok: (m) => m.teams.length > 1 },
  { id: "parejo", dur: 9, Card: C.Balanced, ok: (m) => Boolean(m.balanced) },
  // solo tiene sentido cuando ya pasó el cierre
  { id: "ultimo", dur: 9, Card: C.LastMinute, ok: (m) => Date.parse(m.generatedAt) >= Date.parse(m.window.freeze) && m.lastMinute.count > 0 },
];
const DASH: Slide = { id: "general", dur: 14, Card: C.Dashboard, numbered: false };
const INTRO: Slide = { id: "intro", dur: 8, Card: C.Intro, numbered: false };
const OUTRO: Slide = { id: "outro", dur: 9, Card: C.Outro, numbered: false };
const DASH_EVERY = 6;

function buildSlides(m: M) {
  const cards = CARDS.filter((s) => !s.ok || s.ok(m));
  const out: Slide[] = [INTRO];
  cards.forEach((s, i) => {
    out.push(s);
    if ((i + 1) % DASH_EVERY === 0 && i < cards.length - 1) out.push(DASH);
  });
  out.push(DASH, OUTRO);
  return out;
}

function ago(iso: string, now: number) {
  const min = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  return `hace ${h} h ${min % 60} min`;
}

export function Wrapped() {
  const [m, setM] = useState<M | null>(null);
  const [failed, setFailed] = useState(false);
  const [i, setI] = useState(0);
  const [loop, setLoop] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const hold = useRef(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/wrapped?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as M;
      if (data?.version !== 1) throw new Error("bad metrics");
      setM(data);
      setFailed(false);
    } catch {
      setFailed(true); // seguimos con los últimos datos buenos
    }
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    hold.current = q.has("hold");
    const start = Number(q.get("card"));
    if (start > 0) setI(start);
    if (hold.current) setPaused(true);
    load();
    const tick = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(tick);
  }, [load]);

  const slides = useMemo(() => (m ? buildSlides(m) : []), [m]);
  const index = slides.length ? i % slides.length : 0;
  const slide = slides[index];

  const current = useRef(0);
  useEffect(() => {
    current.current = index;
  }, [index]);
  const go = useCallback(
    (delta: number) => {
      const total = slides.length;
      if (!total) return;
      setLeaving(true);
      setTimeout(() => {
        setLeaving(false);
        const next = current.current + delta;
        if (next >= total) {
          setLoop((l) => l + 1);
          setI(0);
          load(); // nueva vuelta: datos frescos
        } else {
          setI(next < 0 ? total - 1 : next);
        }
      }, 350);
    },
    [slides.length, load],
  );

  // avance automático, respetando la pausa (retoma desde donde quedó)
  const elapsed = useRef(0);
  const startedAt = useRef(0);
  useEffect(() => {
    elapsed.current = 0;
  }, [index, loop]);
  useEffect(() => {
    if (!slide || paused) return;
    startedAt.current = performance.now();
    const t = setTimeout(() => go(1), slide.dur * 1000 - elapsed.current);
    return () => {
      clearTimeout(t);
      elapsed.current += performance.now() - startedAt.current;
    };
  }, [slide, paused, go, index, loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const numbered = slides.filter((s) => s.numbered !== false);
  const cardNumber = slide && slide.numbered !== false ? numbered.indexOf(slide) + 1 : 0;

  return (
    <div className={`wr ${paused ? "wr-paused" : ""}`} style={{ "--dur": `${slide?.dur ?? 9}s` } as CSSProperties}>
      <header className="wr-top">
        <span className="logo">build 101</span>
        <span className="wr-path">~/build-101 · wrapped</span>
        <span className="wr-live">
          <span className="wr-live-dot" aria-hidden />
          {paused ? "en pausa" : "en vivo"}
          {slides.length ? (
            <span className="wr-count">
              {" "}
              · {String(index + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
            </span>
          ) : null}
        </span>
      </header>

      <main className="wr-stage">
        {m && slide ? (
          <section key={`${slide.id}-${index}-${loop}`} className={`wr-card ${leaving ? "out" : ""}`}>
            <slide.Card m={m} idx={cardNumber} />
          </section>
        ) : (
          <div className="wr-empty wr-card">{failed ? "$ build101 --wrapped · reintentando…" : "$ build101 --wrapped · cargando…"}</div>
        )}
      </main>

      <footer className="wr-foot">
        <div className="wr-progress" aria-hidden>
          {slides.map((s, k) => (
            <span key={`${k}-${loop}-${k === index ? index : ""}`} className={`${s === DASH ? "dash" : ""} ${k < index ? "done" : ""} ${k === index ? "now" : ""}`} />
          ))}
        </div>
        <div className="wr-foot-row">
          <span>build. ship. repeat.</span>
          <span>
            {m?.sample ? <span className="tag">datos de ejemplo · </span> : null}
            {m ? `actualizado ${ago(m.generatedAt, now)}` : ""}
            {failed && m ? " · sin conexión, mostrando lo último" : ""}
          </span>
        </div>
      </footer>
    </div>
  );
}
