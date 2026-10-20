"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { GlyphField } from "../components/GlyphField";
import { reducedMotion } from "../components/useInView";
import type { WrappedMetrics } from "@/lib/wrapped-types";

// Las tarjetas de build 101 wrapped. Una idea por pantalla: el dato enorme, una
// línea que lo explica y, como mucho, un renglón de detalle.

type M = WrappedMetrics;
const fmt = new Intl.NumberFormat("es-UY");
const n = (v: number) => fmt.format(Math.round(v));
const pad = (i: number) => String(i).padStart(2, "0");
const pct = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0);
const vars = (v: Record<string, string | number>) => v as CSSProperties;

/** Cuenta de 0 al valor al aparecer (ease-out, ~1.4 s). */
function useCountUp(target: number, ms = 1400) {
  const [v, setV] = useState(() => (reducedMotion() ? target : 0));
  useEffect(() => {
    let raf = 0;
    const still = reducedMotion();
    const t0 = performance.now() + 250;
    const tick = (now: number) => {
      const t = still ? 1 : Math.min(1, Math.max(0, (now - t0) / ms));
      setV(target * (1 - Math.pow(1 - t, 4)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Count({ to, suffix }: { to: number; suffix?: string }) {
  const v = useCountUp(to);
  return (
    <>
      {n(v)}
      {suffix ? <small>{suffix}</small> : null}
    </>
  );
}

/** Aparece escalonado: `i` es el orden. */
function In({ i = 0, className = "", children, as: Tag = "div" }: { i?: number; className?: string; children: ReactNode; as?: "div" | "p" | "h2" | "li" }) {
  return (
    <Tag className={`wr-in ${className}`} style={vars({ "--i": i })}>
      {children}
    </Tag>
  );
}

function Head({ idx, label }: { idx: number; label: string }) {
  return (
    <In className="wr-head">
      <span className="wr-idx">{pad(idx)}</span>
      <span className="wr-eyebrow">// {label}</span>
    </In>
  );
}

function Quote({ text }: { text: string | null }) {
  return text ? <span className="wr-quote">“{text}”</span> : null;
}

function Bars({ rows, compact = false, max }: { rows: { name: ReactNode; value: number; label?: string }[]; compact?: boolean; max?: number }) {
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <ol className={`wr-bars ${compact ? "compact" : ""}`}>
      {rows.map((r, i) => (
        <li key={i} className="wr-bar wr-in" style={vars({ "--i": i + 1 })}>
          <span className="wr-bar-n">{pad(i + 1)}</span>
          <span className="wr-bar-name">{r.name}</span>
          <span className="wr-bar-track">
            <span className="wr-bar-fill" style={vars({ "--w": `${Math.max(2, (r.value / top) * 100)}%`, "--i": i })} />
          </span>
          <span className="wr-bar-v">{r.label ?? n(r.value)}</span>
        </li>
      ))}
    </ol>
  );
}

export function Heatmap({ m, compact = false }: { m: M; compact?: boolean }) {
  const { days, max } = m.heatmap;
  const peak = m.peak;
  return (
    <div>
      <div className="wr-heat">
        {days.map((d, di) => (
          <div key={d.label} style={{ display: "contents" }}>
            <span className="wr-heat-day">{d.label}</span>
            {d.hours.map((v, h) => {
              const isPeak = peak && peak.day === d.label && peak.hour === h;
              return (
                <i
                  key={h}
                  className={`wr-cell ${v === null ? "off" : ""} ${isPeak ? "peak" : ""}`}
                  style={vars({ "--p": v ? `${Math.round(12 + (v / Math.max(1, max)) * 88)}%` : "0%", "--c": h + di * 4 })}
                />
              );
            })}
          </div>
        ))}
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="wr-heat-hour">
            {h % 3 === 0 ? pad(h) : ""}
          </span>
        ))}
      </div>
      {!compact ? (
        <div className="wr-heat-legend wr-in" style={vars({ "--i": 3 })}>
          <span>
            <i style={{ background: "var(--surface)" }} />0
          </span>
          <span>
            <i style={{ background: "var(--accent)" }} />
            {n(max)} commits/hora
          </span>
          <span>
            <i style={{ border: "1px dashed var(--line)" }} />
            fuera del evento
          </span>
        </div>
      ) : null}
    </div>
  );
}

// ---------- tarjetas ----------

type CardProps = { m: M; idx: number };

export function Intro({ m }: CardProps) {
  return (
    <>
      <In className="wr-cmd">
        <span className="sig">$</span>build101 --wrapped<span className="wr-caret" />
      </In>
      <In i={1}>
        <GlyphField className="wr-glyph" lines={["wrapped"]} label="wrapped, escrito con ceros y unos" />
      </In>
      <In i={2} as="p" className="wr-caption" >
        {n(m.totals.teams)} equipos. un fin de semana. esto es lo que construyeron.
      </In>
      <In i={3} as="p" className="wr-sub">
        sáb 17 — dom 18 oct · fium · latu · horas de uruguay
      </In>
    </>
  );
}

export function Receipt({ m, idx }: CardProps) {
  const t = m.totals;
  const lines: [string, number][] = [
    ["commits", t.commits],
    ["líneas escritas", t.linesAdded],
    ["líneas borradas", t.linesDeleted],
    ["archivos", t.files],
    ["builders", t.builders],
    ["repos", t.repos],
    ...(t.prs ? ([["pull requests", t.prs]] as [string, number][]) : []),
  ];
  return (
    <div className="wr-split">
      <div>
        <Head idx={idx} label="el recibo" />
        <In i={1} as="h2" className="wr-title">
          todo lo que
          <br />
          se construyó
          <br />
          este finde.
        </In>
        <In i={2} as="p" className="wr-sub">
          sin contar dependencias, lockfiles ni builds.
        </In>
      </div>
      <In i={2} className="wr-receipt">
        <div className="wr-receipt-head">
          <span>build 101</span>
          <span>17—18 oct</span>
        </div>
        <ul className="wr-receipt-lines">
          {lines.map(([item, v]) => (
            <li key={item}>
              <span>{item}</span>
              <span className="wr-dots" aria-hidden />
              <span className="wr-price">
                <Count to={v} />
              </span>
            </li>
          ))}
        </ul>
        <div className="wr-receipt-total">
          <span>líneas netas</span>
          <span className="wr-receipt-sum">
            +<Count to={Math.max(0, t.linesAdded - t.linesDeleted)} />
          </span>
        </div>
        <p className="wr-receipt-foot">* el café no se contó. build. ship. repeat.</p>
      </In>
    </div>
  );
}

export function HeatCard({ m, idx }: CardProps) {
  return (
    <>
      <Head idx={idx} label="cuándo se programó" />
      <In i={1} as="h2" className="wr-title" >
        el pulso de la hackathon, hora por hora.
      </In>
      <In i={2} className="" >
        <div style={{ marginTop: "calc(var(--u) * 4)" }}>
          <Heatmap m={m} />
        </div>
      </In>
    </>
  );
}

export function Peak({ m, idx }: CardProps) {
  const p = m.peak!;
  return (
    <>
      <Head idx={idx} label="hora pico" />
      <In i={1} className="wr-hero glow">
        {pad(p.hour)}:00
      </In>
      <In i={2} as="p" className="wr-caption">
        la hora con más commits de todo el finde.
      </In>
      <In i={3} as="p" className="wr-sub">
        <strong>{p.day}</strong> · <span className="wr-blue">{n(p.count)} commits</span> entre las {pad(p.hour)}:00 y las {pad((p.hour + 1) % 24)}:00
      </In>
    </>
  );
}

const duration = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)}h ${pad(min % 60)}m`);

export function FastStart({ m, idx }: CardProps) {
  const f = m.fastStart!;
  return (
    <>
      <Head idx={idx} label="salida rápida" />
      <In i={1} className="wr-hero glow">
        {f.minutes < 60 ? (
          <>
            <Count to={f.minutes} />
            <small>min</small>
          </>
        ) : (
          duration(f.minutes)
        )}
      </In>
      <In i={2} as="p" className="wr-caption">
        del kickoff al primer commit.
      </In>
      <In i={3} as="p" className="wr-sub">
        <strong>{f.team}</strong> fue el equipo que arrancó más rápido.
      </In>
    </>
  );
}

export function Owl({ m, idx }: CardProps) {
  const o = m.owl!;
  return (
    <div className="wr-split">
      <div>
        <Head idx={idx} label="el búho" />
        <In i={1} className="wr-hero glow">
          {o.time}
        </In>
        <In i={2} as="p" className="wr-caption">
          el último commit de la noche.
        </In>
        <In i={3} as="p" className="wr-sub">
          <strong>{o.team}</strong> {o.message ? <>· <Quote text={o.message} /></> : null}
        </In>
      </div>
      <In i={3} className="wr-side">
        <p className="wr-k">la sede cerró a las {m.window.venueClose}</p>
        <p className="wr-hero wr-hero-md" style={{ marginTop: "calc(var(--u) * 1.4)" }}>
          <Count to={o.afterHours} />
        </p>
        <p className="wr-sub">commits se hicieron desde casa, entre las 21:00 y las 09:00.</p>
      </In>
    </div>
  );
}

export function EarlyBird({ m, idx }: CardProps) {
  const e = m.earlyBird!;
  return (
    <>
      <Head idx={idx} label="madrugador" />
      <In i={1} className="wr-hero glow">
        {e.time}
      </In>
      <In i={2} as="p" className="wr-caption">
        el primer commit del domingo.
      </In>
      <In i={3} as="p" className="wr-sub">
        <strong>{e.team}</strong> {e.message ? <>· <Quote text={e.message} /></> : null}
      </In>
    </>
  );
}

export function Sleepless({ m, idx }: CardProps) {
  const s = m.sleepless!;
  return (
    <>
      <Head idx={idx} label="¿durmieron?" />
      <In i={1} className="wr-hero glow">
        {duration(s.longestRestMin)}
      </In>
      <In i={2} as="p" className="wr-caption">
        fue el descanso más largo de {s.team} en toda la noche.
      </In>
      <In i={3} as="p" className="wr-sub">
        <span className="wr-blue">{n(s.nightCommits)} commits</span> entre las 21:00 y las 09:00. respeto.
      </In>
    </>
  );
}

export function LastMinute({ m, idx }: CardProps) {
  const l = m.lastMinute;
  return (
    <>
      <Head idx={idx} label="a último minuto" />
      <In i={1} className="wr-hero glow">
        <Count to={l.count} />
      </In>
      <In i={2} as="p" className="wr-caption">
        commits en los últimos {l.minutes} minutos antes del cierre.
      </In>
      <In i={3} as="p" className="wr-sub">
        <strong>{n(l.teams)} equipos</strong> empujando hasta el final.
      </In>
    </>
  );
}

export function Monster({ m, idx }: CardProps) {
  const c = m.monster!;
  return (
    <>
      <Head idx={idx} label="el commit monstruo" />
      <In i={1} className="wr-hero glow">
        <Count to={c.lines} />
      </In>
      <In i={2} as="p" className="wr-caption">
        líneas cambiadas en un solo commit.
      </In>
      <In i={3} as="p" className="wr-sub">
        <strong>{c.team}</strong> · <span className="wr-blue wr-mono">+{n(c.added)} −{n(c.deleted)}</span> en {n(c.files)} archivos
        {c.message ? (
          <>
            <br />
            <Quote text={c.message} />
          </>
        ) : null}
      </In>
    </>
  );
}

export function Words({ m, idx }: CardProps) {
  const words = m.words.slice(0, 16);
  const max = words[0]?.count ?? 1;
  return (
    <>
      <Head idx={idx} label="lo que más se escribió" />
      <In i={1} as="h2" className="wr-title" >
        las palabras de los commits.
      </In>
      <div className="wr-cloud" style={{ marginTop: "calc(var(--u) * 3.6)" }}>
        {words.map((w, i) => (
          <span key={w.word} className="wr-in" style={vars({ "--s": (1.8 + Math.sqrt(w.count / max) * 4.6).toFixed(2), "--i": Math.min(i, 10) * 0.6 + 1 })}>
            {w.word}
            <sup>{n(w.count)}</sup>
          </span>
        ))}
      </div>
    </>
  );
}

export function Counters({ m, idx }: CardProps) {
  const counters = m.counters.filter((c) => c.count > 0);
  const max = Math.max(...counters.map((c) => c.count));
  return (
    <>
      <Head idx={idx} label="el contador" />
      <In i={1} as="h2" className="wr-title">
        cuántas veces lo escribieron.
      </In>
      <div className="wr-tiles" style={{ marginTop: "calc(var(--u) * 3.6)" }}>
        {counters.map((c, i) => (
          <In key={c.label} i={i * 0.5 + 2} className={`wr-tile ${c.count === max ? "hot" : ""}`}>
            <div className="wr-tile-v">
              <Count to={c.count} />
            </div>
            <div className="wr-tile-l">{c.label === "emojis" ? "emojis" : `“${c.label}”`}</div>
          </In>
        ))}
      </div>
    </>
  );
}

export function Extremes({ m, idx }: CardProps) {
  const long = m.longest!;
  const short = m.shortest!;
  return (
    <div className="wr-split">
      <div>
        <Head idx={idx} label="el más largo" />
        <In i={1} className="wr-hero wr-hero-md">
          <Count to={long.chars} />
          <small>caracteres</small>
        </In>
        <In i={2} as="p" className="wr-long">
          “{long.message}”
        </In>
        <In i={3} as="p" className="wr-sub">
          <strong>{long.team}</strong>
        </In>
      </div>
      <In i={2} className="wr-side">
        <p className="wr-eyebrow">// el más corto</p>
        <p className="wr-k" style={{ marginTop: "calc(var(--u) * 2.4)" }}>
          $ git commit -m
        </p>
        <p className="wr-short">&quot;{short.message}&quot;</p>
        <p className="wr-sub">
          <strong>{short.team}</strong> · {short.chars} {short.chars === 1 ? "caracter" : "caracteres"}. no hacía falta más.
        </p>
      </In>
    </div>
  );
}

export function Funny({ m, idx }: CardProps) {
  return (
    <>
      <Head idx={idx} label="top 5 commits" />
      <ol className="wr-msgs">
        {m.funny.slice(0, 5).map((f, i) => (
          <In key={i} i={i + 1} as="li" className="wr-msg">
            <span className="wr-msg-n">{pad(i + 1)}</span>
            <span className="wr-msg-t">
              “{f.message}”<span className="wr-msg-team">{f.team}</span>
            </span>
          </In>
        ))}
      </ol>
    </>
  );
}

export function AiShare({ m, idx }: CardProps) {
  const p = pct(m.ai.coauthored, m.ai.total);
  return (
    <div className="wr-split">
      <div>
        <Head idx={idx} label="la IA en el equipo" />
        <In i={1} className="wr-hero glow">
          <Count to={p} suffix="%" />
        </In>
        <In i={2} as="p" className="wr-caption">
          de los commits se escribieron junto a un agente de IA.
        </In>
        <In i={3} as="p" className="wr-sub">
          <span className="wr-blue">{n(m.ai.coauthored)}</span> de {n(m.ai.total)} commits con un trailer de claude, cursor, copilot, kiro y compañía.
        </In>
      </div>
      <In i={2} className="wr-side">
        <div className="wr-waffle" aria-hidden>
          {Array.from({ length: 100 }, (_, i) => (
            <i key={i} className={i < p ? "on" : ""} style={vars({ "--c": i })} />
          ))}
        </div>
      </In>
    </div>
  );
}

function RankCard({ idx, label, title, rows, unit }: { idx: number; label: string; title: string; rows: { name: string; teams: number }[]; unit: string }) {
  return (
    <>
      <Head idx={idx} label={label} />
      <In i={1} as="h2" className="wr-title">
        {title}
      </In>
      <In i={1} as="p" className="wr-sub">
        {unit}
      </In>
      <div style={{ marginTop: "calc(var(--u) * 3)" }}>
        <Bars rows={rows.slice(0, 7).map((r) => ({ name: r.name, value: r.teams }))} />
      </div>
    </>
  );
}

export const Frameworks = ({ m, idx }: CardProps) => (
  <RankCard idx={idx} label="el stack" title="con qué construyeron." rows={m.frameworks} unit="equipos que lo usan" />
);

export function Languages({ m, idx }: CardProps) {
  const langs = m.languages;
  return (
    <>
      <Head idx={idx} label="lenguajes" />
      <In i={1} as="h2" className="wr-title">
        en qué se escribió.
      </In>
      <In i={1} as="p" className="wr-sub">
        porcentaje del código de todos los repos
      </In>
      <div style={{ marginTop: "calc(var(--u) * 3)" }}>
        <Bars compact max={100} rows={langs.map((l) => ({ name: l.name, value: l.pct, label: `${String(l.pct).replace(".", ",")}%` }))} />
      </div>
    </>
  );
}

export function Teams({ m, idx }: CardProps) {
  const anyFinal = m.teams.some((t) => t.finalista);
  return (
    <>
      <Head idx={idx} label="ranking de commits" />
      <In i={1} as="h2" className="wr-title">
        los equipos que más commitearon.
      </In>
      <div style={{ marginTop: "calc(var(--u) * 3)" }}>
        <Bars
          compact
          rows={m.teams.slice(0, 8).map((t) => ({
            name: (
              <>
                {t.team}
                {anyFinal && t.finalista ? <span className="wr-tag">finalista</span> : null}
              </>
            ),
            value: t.commits,
          }))}
        />
      </div>
    </>
  );
}

export function Balanced({ m, idx }: CardProps) {
  const b = m.balanced!;
  const max = Math.max(...b.shares);
  return (
    <div className="wr-split">
      <div>
        <Head idx={idx} label="el equipo más parejo" />
        <In i={1} as="h2" className="wr-title" >
          {b.team}
        </In>
        <In i={2} as="p" className="wr-caption">
          el reparto de commits más parejo de la hackathon.
        </In>
        <In i={3} as="p" className="wr-sub">
          {b.shares.map((s) => `${s}%`).join(" · ")} de {n(b.commits)} commits. trabajo en equipo de verdad.
        </In>
      </div>
      <In i={2} className="wr-side">
        <div className="wr-shares">
          {b.shares.map((s, i) => (
            <div key={i} className="wr-share">
              <span>{s}%</span>
              <i style={vars({ "--h": `${(s / max) * 82}%`, "--i": i })} />
            </div>
          ))}
        </div>
      </In>
    </div>
  );
}

export function Dashboard({ m }: CardProps) {
  const t = m.totals;
  const tiles: [string, number, string?][] = [
    ["commits", t.commits],
    ["líneas escritas", t.linesAdded],
    ["builders", t.builders],
    ["equipos", t.teams],
    ["con IA", pct(m.ai.coauthored, m.ai.total), "%"],
  ];
  return (
    <div className="wr-dash">
      <div className="wr-tiles">
        {tiles.map(([label, v, suffix], i) => (
          <In key={label} i={i * 0.5} className={`wr-tile ${i === 4 ? "hot" : ""}`}>
            <div className="wr-tile-v">
              <Count to={v} />
              {suffix}
            </div>
            <div className="wr-tile-l">{label}</div>
          </In>
        ))}
      </div>
      <In i={2} className="wr-panel">
        <p className="wr-k">$ build101 --status · commits por hora</p>
        <Heatmap m={m} compact />
        <div className="wr-mini">
          {m.peak ? (
            <p>
              <span>hora pico</span>
              {pad(m.peak.hour)}:00
            </p>
          ) : null}
          {m.owl ? (
            <p>
              <span>el búho</span>
              {m.owl.time}
            </p>
          ) : null}
          {m.monster ? (
            <p>
              <span>commit monstruo</span>
              {n(m.monster.lines)}
            </p>
          ) : null}
        </div>
      </In>
      <In i={3} className="wr-panel">
        <p className="wr-k">top equipos</p>
        <Bars rows={m.teams.slice(0, 5).map((tm) => ({ name: tm.team, value: tm.commits }))} />
      </In>
    </div>
  );
}

export function Outro({ m }: CardProps) {
  return (
    <>
      <In className="wr-cmd">
        <span className="sig">$</span>git push origin main<span className="wr-caret" />
      </In>
      <In i={1} as="h2" className="wr-big-word" >
        build. ship. repeat.
      </In>
      <In i={2} as="p" className="wr-caption">
        gracias, builders. nos vemos en el próximo build.
      </In>
      <In i={3} as="p" className="wr-sub">
        {n(m.totals.commits)} commits · {n(m.totals.linesAdded)} líneas · {n(m.totals.teams)} equipos · build101.dev
      </In>
    </>
  );
}
