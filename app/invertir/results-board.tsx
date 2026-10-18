"use client";

import Link from "next/link";
import { INVESTMENT_GAME, INVESTMENT_TEAMS, INVESTORS, money } from "@/lib/investment-game";
import { Icon, TeamMark } from "./ui";
import { StorageNotice, useGame } from "./use-game";

export function ResultsBoard() {
  const { snapshot, error, loading, refresh } = useGame(undefined, true);
  const results = snapshot?.results;
  const maximum = results?.teams[0]?.amount || 1;
  const lastUpdated = snapshot ? new Date(snapshot.updatedAt).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--";

  function exportResults() {
    if (!results) return;
    const rows = [["posición", "equipo", "capital_usd", "inversores", "porcentaje"], ...results.teams.map((team, i) => [String(i + 1), INVESTMENT_TEAMS.find((entry) => entry.id === team.teamId)!.name, String(team.amount), String(team.investors), String(results.total ? Math.round(team.amount / results.total * 1000) / 10 : 0)])];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `build101-${INVESTMENT_GAME.roundId}-resultados.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <>
    <StorageNotice snapshot={snapshot} />
    <section className="iv-results-hero"><div><p className="eyebrow">// RESULTADOS</p><h1 className="iv-title">así vienen las inversiones<span className="iv-blue">.</span></h1><p className="iv-lede">Mirá cuánto capital viene levantando cada equipo.</p></div><div className="iv-live-panel"><span className="iv-live-label"><span className="iv-live-dot" /> {error ? "SIN CONEXIÓN" : "RESULTADOS EN VIVO"}</span><span className="iv-label">SE ACTUALIZA CADA 5 SEGUNDOS</span></div></section>
    <div className="iv-stats"><div><span className="iv-label">CAPITAL INVERTIDO</span><strong>{results ? money(results.total) : "—"}<span className="iv-stat-unit">USD</span></strong><p>de {money(INVESTORS.length * INVESTMENT_GAME.budget)} disponibles</p></div><div><span className="iv-label">CARTERAS CONFIRMADAS</span><strong>{results?.submitted ?? "—"}<span className="iv-stat-denominator">/ {INVESTORS.length}</span></strong><p>{results ? Math.round(results.submitted / results.participants * 100) : 0}% de los builders ya invirtió</p></div><div><span className="iv-label">EQUIPOS EN LA RONDA</span><strong>{INVESTMENT_TEAMS.length}<span className="iv-stat-denominator">ideas en juego</span></strong><p>un fin de semana. todo por construir.</p></div></div>
    <div className="iv-section-head iv-ranking-heading"><div><p className="iv-label">// RANKING</p><h2>capital por equipo<span className="iv-blue">.</span></h2></div><div className="iv-ranking-actions"><span className="iv-updated">ACTUALIZADO {lastUpdated}</span><button type="button" className="iv-export" disabled={!results} onClick={exportResults}>exportar CSV ↗</button></div></div>
    {error && <div className="iv-error" role="alert">{error} {snapshot && "Mostrando la última actualización disponible."} <button type="button" onClick={() => void refresh()}>reintentar ↗</button></div>}
    {loading && !results ? <div className="iv-loading" role="status">siguiendo el capital<span className="iv-blue">_</span></div> : results && <div className="iv-ranking" role="table" aria-label="Ranking de capital por equipo"><div className="iv-ranking-header" role="row"><span role="columnheader">POS.</span><span role="columnheader">EQUIPO / PRODUCTO</span><span role="columnheader">CAPITAL LEVANTADO</span><span role="columnheader">INVERSORES</span><span role="columnheader">% DEL CAPITAL</span></div>{results.teams.map((result, position) => {
      const index = INVESTMENT_TEAMS.findIndex((team) => team.id === result.teamId);
      const team = INVESTMENT_TEAMS[index];
      const share = results.total ? result.amount / results.total * 100 : 0;
      // Ties share the same position and the same leading treatment.
      const rank = results.teams.findIndex((entry) => entry.amount === result.amount) + 1;
      const leader = result.amount > 0 && result.amount === results.teams[0].amount;
      return <div className={`iv-ranking-row ${leader ? "iv-leader" : ""}`} role="row" key={team.id}><span className="iv-rank" role="cell">{String(rank).padStart(2, "0")}{leader && <span className="sr-only">, liderando</span>}</span><div className="iv-ranking-team" role="cell"><TeamMark index={index} /><div><strong>{team.name}{leader && <span className="iv-leader-tag">LIDERANDO ↗</span>}</strong><span>{team.category}</span></div></div><div className="iv-ranking-capital" role="cell"><strong>{money(result.amount)}</strong><div className="iv-ranking-bar"><span style={{ width: `${result.amount / maximum * 100}%` }} /></div></div><span className="iv-ranking-investors" role="cell">{String(result.investors).padStart(2, "0")}<small> inversores</small></span><span className="iv-ranking-share" role="cell">{new Intl.NumberFormat("es-UY", { maximumFractionDigits: 1 }).format(share)}%</span><span className="sr-only">Fila {position + 1}</span></div>;
    })}<div className="iv-ranking-total"><span>EL IMPULSO TOTAL</span><strong>{money(results.total)}</strong><span>{results.submitted} CARTERAS</span></div></div>}
    {results?.total === 0 && <div className="iv-empty"><TeamMark index={5} large /><h2>la primera apuesta puede ser tuya.</h2><p>El ranking se mueve cuando se confirma la primera cartera.</p></div>}
    <div className="iv-results-footer"><p><Icon name="lock" size={14} /> Solo se cuenta la última cartera confirmada de cada persona.</p><Link href="/invertir" className="btn btn-ghost btn-sm">armar mi cartera <Icon name="arrow" size={17} /></Link></div>
  </>;
}
