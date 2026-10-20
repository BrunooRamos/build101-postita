"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FC, type TouchEvent } from "react";
import type { WrappedMetrics } from "@/lib/wrapped-types";
import * as C from "./cards";

// Las tarjetas se pasan a mano: ← → del teclado, las flechas de los costados,
// los segmentos de la barra de abajo o deslizando en el celular. La tarjeta
// actual queda en la URL (/wrapped?card=5) para poder compartirla.
//
// Teclas: ← → anterior / siguiente · inicio / fin · f pantalla completa.

type M = WrappedMetrics;
type Slide = { id: string; Card: FC<{ m: M; idx: number }>; ok?: (m: M) => boolean; numbered?: boolean };

const CARDS: Slide[] = [
  { id: "recibo", Card: C.Receipt },
  { id: "heatmap", Card: C.HeatCard, ok: (m) => m.heatmap.max > 0 },
  { id: "pico", Card: C.Peak, ok: (m) => Boolean(m.peak) },
  { id: "salida", Card: C.FastStart, ok: (m) => Boolean(m.fastStart) },
  { id: "buho", Card: C.Owl, ok: (m) => Boolean(m.owl) },
  { id: "madrugador", Card: C.EarlyBird, ok: (m) => Boolean(m.earlyBird) },
  { id: "durmieron", Card: C.Sleepless, ok: (m) => Boolean(m.sleepless) },
  { id: "ia", Card: C.AiShare, ok: (m) => m.ai.total > 0 },
  { id: "lenguajes", Card: C.Languages, ok: (m) => m.languages.length > 1 },
  { id: "stack", Card: C.Frameworks, ok: (m) => m.frameworks.length > 1 },
  { id: "monstruo", Card: C.Monster, ok: (m) => Boolean(m.monster) },
  { id: "palabras", Card: C.Words, ok: (m) => m.words.length >= 6 },
  { id: "contador", Card: C.Counters, ok: (m) => m.counters.some((c) => c.count > 0) },
  { id: "extremos", Card: C.Extremes, ok: (m) => Boolean(m.longest && m.shortest) },
  { id: "graciosos", Card: C.Funny, ok: (m) => m.funny.length >= 3 },
  { id: "equipos", Card: C.Teams, ok: (m) => m.teams.length > 1 },
  { id: "parejo", Card: C.Balanced, ok: (m) => Boolean(m.balanced) },
  // solo tiene sentido cuando ya pasó el cierre
  { id: "ultimo", Card: C.LastMinute, ok: (m) => Date.parse(m.generatedAt) >= Date.parse(m.window.freeze) && m.lastMinute.count > 0 },
];
const DASH: Slide = { id: "general", Card: C.Dashboard, numbered: false };
const INTRO: Slide = { id: "intro", Card: C.Intro, numbered: false };
const OUTRO: Slide = { id: "outro", Card: C.Outro, numbered: false };

function buildSlides(m: M) {
  return [INTRO, ...CARDS.filter((s) => !s.ok || s.ok(m)), DASH, OUTRO];
}

export function Wrapped() {
  const [m, setM] = useState<M | null>(null);
  const [failed, setFailed] = useState(false);
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/wrapped", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as M;
      if (data?.version !== 1) throw new Error("bad metrics");
      setM(data);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    const start = Number(new URLSearchParams(window.location.search).get("card"));
    if (start > 0) setI(start - 1);
    load();
  }, [load]);

  const slides = useMemo(() => (m ? buildSlides(m) : []), [m]);
  const total = slides.length;
  const index = total ? Math.min(i, total - 1) : 0;
  const slide = slides[index];

  const current = useRef(0);
  useEffect(() => {
    current.current = index;
    if (!total) return;
    const url = new URL(window.location.href);
    if (index) url.searchParams.set("card", String(index + 1));
    else url.searchParams.delete("card");
    window.history.replaceState(null, "", url);
  }, [index, total]);

  const goTo = useCallback(
    (target: number) => {
      if (!total) return;
      const next = Math.max(0, Math.min(total - 1, target));
      if (next === current.current) return;
      // el destino se fija ya, así varias teclas seguidas suman bien
      current.current = next;
      setLeaving(true);
      setTimeout(() => {
        setLeaving(false);
        setI(next);
      }, 250);
    },
    [total],
  );
  const go = useCallback((delta: number) => goTo(current.current + delta), [goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(total - 1);
      else if (e.key === "f" || e.key === "F") {
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else document.documentElement.requestFullscreen().catch(() => {});
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, goTo, total]);

  // deslizar en pantallas táctiles
  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent) => {
    touchX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchX.current;
    touchX.current = null;
    const end = e.changedTouches[0]?.clientX;
    if (start === null || end === undefined || Math.abs(end - start) < 40) return;
    go(end < start ? 1 : -1);
  };

  const numbered = slides.filter((s) => s.numbered !== false);
  const cardNumber = slide && slide.numbered !== false ? numbered.indexOf(slide) + 1 : 0;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <div className="wr" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="wr-top">
        <span className="logo">build 101</span>
        <span className="wr-path">~/build-101 · wrapped</span>
        <span className="wr-live">
          {total ? (
            <span className="wr-count">
              {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
            </span>
          ) : null}
        </span>
      </header>

      <main className="wr-stage">
        {m && slide ? (
          <section key={`${slide.id}-${index}`} className={`wr-card ${leaving ? "out" : ""}`} aria-live="polite">
            <slide.Card m={m} idx={cardNumber} />
          </section>
        ) : (
          <div className="wr-empty wr-card">
            {failed ? (
              <button type="button" className="wr-retry" onClick={load}>
                $ build101 --wrapped · no cargó, reintentar
              </button>
            ) : (
              "$ build101 --wrapped · cargando…"
            )}
          </div>
        )}
        {total ? (
          <>
            <button type="button" className="wr-arrow prev" onClick={() => go(-1)} disabled={isFirst} aria-label="tarjeta anterior">
              ←
            </button>
            <button type="button" className="wr-arrow next" onClick={() => go(1)} disabled={isLast} aria-label="tarjeta siguiente">
              →
            </button>
          </>
        ) : null}
      </main>

      <footer className="wr-foot">
        <nav className="wr-progress" aria-label="tarjetas">
          {slides.map((s, k) => (
            <button
              type="button"
              key={`${s.id}-${k}`}
              className={`${s === DASH ? "dash" : ""} ${k < index ? "done" : ""} ${k === index ? "now" : ""}`}
              onClick={() => goTo(k)}
              aria-label={`ir a la tarjeta ${k + 1}`}
              aria-current={k === index ? "step" : undefined}
            />
          ))}
        </nav>
        <div className="wr-foot-row">
          <span>build. ship. repeat.</span>
          <span>{isLast ? "fin · ← para volver" : "← → para pasar"}</span>
        </div>
      </footer>
    </div>
  );
}
