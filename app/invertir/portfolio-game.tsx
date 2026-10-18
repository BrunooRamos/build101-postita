"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { INVESTMENT_GAME, INVESTMENT_TEAMS, INVESTOR_TEAMS, INVESTORS, money, type Allocations, type Portfolio } from "@/lib/investment-game";
import { PixelBlocks, PIXELS_SMALL } from "../components/PixelBlocks";
import { Icon, TeamMark } from "./ui";
import { StorageNotice, useGame } from "./use-game";

const IDENTITY_KEY = `${INVESTMENT_GAME.roundId}:identity`;

export function PortfolioGame() {
  const [investorId, setInvestorId] = useState("");
  const [teamId, setTeamId] = useState("");
  const [personId, setPersonId] = useState("");
  const investor = INVESTORS.find((person) => person.id === investorId);
  const ownTeam = INVESTOR_TEAMS.find((team) => team.id === investor?.teamId);
  const { snapshot, error, loading, refresh, save } = useGame(investorId || undefined);

  useEffect(() => {
    // Restore only the selected identity; portfolios always come from the store.
    const restore = async () => {
      try {
        const saved = sessionStorage.getItem(IDENTITY_KEY);
        if (INVESTORS.some((person) => person.id === saved)) setInvestorId(saved!);
      } catch { /* Selection still works without session storage. */ }
    };
    void restore();
  }, []);

  function chooseInvestor(id: string) {
    setInvestorId(id);
    try { sessionStorage.setItem(IDENTITY_KEY, id); } catch { /* Optional convenience. */ }
  }

  return <>
    <StorageNotice snapshot={snapshot} />
    <section className="iv-hero">
      <div><p className="eyebrow">// JUEGO DE INVERSIÓN</p><h1 className="iv-title">simulá ser inversor<span className="iv-blue">.</span></h1><p className="iv-lede">Invertí tu millón en los equipos que creas que tienen más futuro.</p></div>
      <div className="iv-capital"><PixelBlocks id="invest-hero" cells={PIXELS_SMALL} cols={4} rows={4} className="iv-capital-pixels" /><span className="iv-label">TU CAPITAL INICIAL</span><strong><small>US$</small>1.000.000</strong><span className="iv-capital-foot"><span className="iv-live-dot" /> 100% FICTICIO · 100% TU DECISIÓN</span></div>
    </section>

    {!investor ? <>
      <section className="iv-identity">
        <div className="iv-identity-copy"><span className="iv-step">01 / IDENTIFICATE</span><h2>primero, <br />¿quién invierte?</h2><p>Elegí tu equipo y tu nombre para abrir tu cartera personal.</p><span className="iv-rule-note"><Icon name="lock" size={15} /> Tu equipo queda fuera de tu inversión.</span></div>
        <form className="iv-identity-form" onSubmit={(event) => { event.preventDefault(); if (personId) chooseInvestor(personId); }}>
          <div className="iv-selects"><div className="iv-field"><label htmlFor="invest-team">tu equipo</label><select id="invest-team" required value={teamId} onChange={(event) => { setTeamId(event.target.value); setPersonId(""); }}><option value="" disabled>Seleccioná tu equipo</option>{INVESTOR_TEAMS.map((team) => <option key={team.id} value={team.id}>{String(team.number).padStart(2, "0")} · {team.name}</option>)}</select></div>
          <div className="iv-field"><label htmlFor="invest-person">tu nombre</label><select id="invest-person" required disabled={!teamId} value={personId} onChange={(event) => setPersonId(event.target.value)}><option value="" disabled>{teamId ? "Seleccioná tu nombre" : "Primero elegí tu equipo"}</option>{INVESTOR_TEAMS.find((team) => team.id === teamId)?.members.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></div></div>
          <button className="btn btn-primary iv-open" type="submit" disabled={!personId}>abrir mi cartera <Icon name="arrow" size={19} /></button><p className="iv-small">Una cartera por persona. Podés editarla y volver a confirmar.</p>
        </form>
      </section>
      <div className="iv-section-head"><div><p className="iv-label">// LOS QUE ESTÁN CONSTRUYENDO</p><h2>conocé a los equipos<span className="iv-blue">.</span></h2></div><span className="iv-count">{INVESTMENT_TEAMS.length} PROYECTOS <span>/</span> {INVESTORS.length} INVERSORES</span></div>
      <div className="iv-preview-grid">{INVESTMENT_TEAMS.map((team, index) => <article className="iv-preview-card" key={team.id}><div className="iv-card-top"><TeamMark index={index} /><span className="iv-card-number">{String(index + 1).padStart(2, "0")}</span></div><span className="iv-category">{team.category}</span><h3>{team.name}<span>↗</span></h3><p>{team.description}</p><div className="iv-preview-foot">{team.teamId ? `${INVESTOR_TEAMS.find((entry) => entry.id === team.teamId)?.members.length ?? 0} BUILDERS` : "PROYECTO DEMO"} <span>AI PRODUCT</span></div></article>)}</div>
      <div className="iv-how"><div><span>01</span> Elegí quién sos</div><div><span>02</span> Repartí tu millón</div><div><span>03</span> Dale impulso a tus favoritos</div></div>
    </> : <>
      <div className="iv-investor-bar"><div className="iv-avatar">{investor.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div><div><span className="iv-label">INVIRTIENDO COMO</span><strong>{investor.name}<span className="iv-investor-team">/ {ownTeam?.name}</span></strong></div><button type="button" className="iv-text-button" onClick={() => { if (window.confirm("¿Cambiar de participante? Los cambios sin confirmar se van a descartar.")) { chooseInvestor(""); setPersonId(""); } }}>cambiar <span>↗</span></button></div>
      {error && <div className="iv-error" role="alert">{error} <button type="button" onClick={() => void refresh()}>reintentar ↗</button></div>}
      {loading ? <div className="iv-loading" role="status">abriendo tu cartera<span className="iv-blue">_</span></div> : snapshot && <PortfolioEditor key={investor.id} investorId={investor.id} ownTeamId={investor.teamId} initial={snapshot.portfolio?.investorId === investor.id ? snapshot.portfolio : null} save={save} readOnly={!INVESTMENT_GAME.open || (snapshot.storage === "preview" && !INVESTMENT_GAME.demo)} />}
    </>}
  </>;
}

function PortfolioEditor({ investorId, ownTeamId, initial, save, readOnly }: { investorId: string; ownTeamId: string; initial: Portfolio | null; save: (portfolio: Pick<Portfolio, "investorId" | "allocations">) => Promise<unknown>; readOnly: boolean }) {
  const [allocations, setAllocations] = useState<Allocations>(initial?.allocations ?? {});
  const [confirmed, setConfirmed] = useState<Allocations | null>(initial?.allocations ?? null);
  const [search, setSearch] = useState("");
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [success, setSuccess] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const total = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  const remaining = INVESTMENT_GAME.budget - total;
  const selected = INVESTMENT_TEAMS.filter((team) => (allocations[team.id] ?? 0) > 0);
  const dirty = JSON.stringify(INVESTMENT_TEAMS.map((team) => allocations[team.id] ?? 0)) !== JSON.stringify(INVESTMENT_TEAMS.map((team) => confirmed?.[team.id] ?? 0));
  const canSubmit = !readOnly && remaining === 0 && dirty;

  useEffect(() => {
    if (review) dialog.current?.showModal();
    else dialog.current?.close();
  }, [review]);

  useEffect(() => {
    if (!dirty) return;
    const preventUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", preventUnload);
    return () => window.removeEventListener("beforeunload", preventUnload);
  }, [dirty]);

  function allocate(teamId: string, amount: number) {
    if (readOnly || INVESTMENT_TEAMS.find((team) => team.id === teamId)?.teamId === ownTeamId) return;
    const current = allocations[teamId] ?? 0;
    const next = Math.min(current + remaining, Math.max(0, Math.round(amount / INVESTMENT_GAME.step) * INVESTMENT_GAME.step));
    setAllocations((previous) => ({ ...previous, [teamId]: next }));
    setSuccess(false);
  }

  async function confirm() {
    setSaving(true);
    setSaveError("");
    try {
      await save({ investorId, allocations });
      setConfirmed({ ...allocations });
      setReview(false);
      setSuccess(true);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "No pudimos guardar la cartera.");
    } finally { setSaving(false); }
  }

  const visibleTeams = INVESTMENT_TEAMS.filter((team) => `${team.name} ${team.category} ${team.description}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));

  return <>
    {success && <div className="iv-success" role="status"><span className="iv-success-icon"><Icon name="check" /></span><div><strong>tu capital ya está jugando.</strong><p>Guardamos tu inversión. Podés ajustarla mientras la ronda siga abierta.</p></div><Link href="/invertir/resultados">ver resultados <Icon name="arrow" size={18} /></Link></div>}
    {readOnly && <div className="iv-error" role="status">La ronda está cerrada o todavía no está habilitada para guardar inversiones.</div>}
    <div className="iv-section-head iv-portfolio-heading"><div><p className="iv-label">02 / ARMÁ TU CARTERA</p><h2>¿a quién le ves futuro<span className="iv-blue">?</span></h2><p className="iv-section-description">Repartí el millón completo, en pasos de US$ 25.000. Vos elegís en cuántos equipos.</p></div><label className="iv-search"><span className="sr-only">Buscar equipos</span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="8" cy="8" r="5.5" /><path d="m12 12 5 5" /></svg><input type="search" placeholder="Buscar equipo…" value={search} onChange={(event) => setSearch(event.target.value)} /></label></div>
    <div className="iv-workspace"><section aria-label="equipos para invertir"><div className="iv-invest-grid">{visibleTeams.map((team) => {
      const index = INVESTMENT_TEAMS.findIndex((entry) => entry.id === team.id);
      const own = team.teamId === ownTeamId;
      const amount = allocations[team.id] ?? 0;
      return <article key={team.id} className={`iv-invest-card ${own ? "iv-own" : ""} ${amount > 0 ? "iv-selected" : ""}`}>
        <div className="iv-card-top"><TeamMark index={index} /><span className="iv-card-number">{own ? <span className="iv-own-tag"><Icon name="lock" size={12} /> TU EQUIPO</span> : `${String(index + 1).padStart(2, "0")} / ${INVESTMENT_TEAMS.length}`}</span></div>
        <span className="iv-category">{team.category}</span><h3>{team.name}</h3><p>{team.description}</p>
        {own ? <div className="iv-own-message"><Icon name="lock" size={15} /> El próximo impulso viene de otros.</div> : <div className="iv-allocation-controls"><div className="iv-amount-row"><button type="button" aria-label={`Quitar US$ 25.000 a ${team.name}`} disabled={readOnly || amount === 0} onClick={() => allocate(team.id, amount - INVESTMENT_GAME.step)}>−</button><label className="iv-amount-input"><span className="sr-only">Inversión en {team.name}</span><span>US$</span><input type="number" inputMode="numeric" min={0} max={amount + remaining} step={INVESTMENT_GAME.step} value={amount || ""} placeholder="0" disabled={readOnly} onChange={(event) => allocate(team.id, Number(event.target.value))} /></label><button type="button" aria-label={`Sumar US$ 25.000 a ${team.name}`} disabled={readOnly || remaining === 0} onClick={() => allocate(team.id, amount + INVESTMENT_GAME.step)}>+</button></div>
        <input className="iv-range" type="range" aria-label={`Distribuir capital a ${team.name}`} min={0} max={INVESTMENT_GAME.budget} step={INVESTMENT_GAME.step} value={amount} disabled={readOnly} style={{ "--range": `${amount / INVESTMENT_GAME.budget * 100}%` } as React.CSSProperties} onChange={(event) => allocate(team.id, Number(event.target.value))} />
        <div className="iv-quick"><span>{Math.round(amount / INVESTMENT_GAME.budget * 100)}% DE TU CAPITAL</span><button type="button" disabled={readOnly || remaining === 0} onClick={() => allocate(team.id, amount + 100_000)}>+100k</button><button type="button" disabled={readOnly || (remaining === 0 && amount === 0)} onClick={() => allocate(team.id, amount + remaining)}>el resto ↗</button></div></div>}
      </article>;
    })}</div>{visibleTeams.length === 0 && <div className="iv-empty"><p>Ningún equipo coincide con “{search}”.</p><button className="iv-text-button" type="button" onClick={() => setSearch("")}>ver todos los equipos ↗</button></div>}</section>
    <aside className="iv-summary" aria-label="resumen de tu cartera"><div className="iv-summary-head"><Icon name="wallet" size={18} /><span>TU CARTERA</span><span className="iv-summary-count">{String(selected.length).padStart(2, "0")}</span></div><div className="iv-summary-body"><span className="iv-label">TE QUEDA POR INVERTIR</span><strong className={`iv-remaining ${remaining === 0 ? "iv-complete" : ""}`}><small>US$</small>{new Intl.NumberFormat("es-UY").format(remaining)}</strong><div className="iv-budget-track"><span style={{ width: `${total / INVESTMENT_GAME.budget * 100}%` }} /></div><div className="iv-budget-meta"><span>{Math.round(total / INVESTMENT_GAME.budget * 100)}% ASIGNADO</span><span>DE US$ 1M</span></div>
      <div className="iv-summary-list">{selected.length === 0 ? <div className="iv-summary-empty"><TeamMark index={5} /><p>Las grandes apuestas<br />empiezan con una decisión.</p><span>Elegí tu primer equipo ↙</span></div> : selected.map((team) => <div key={team.id}><span><i />{team.name}</span><strong>{money(allocations[team.id])}</strong></div>)}</div>
      <div className="iv-summary-total"><span>TOTAL INVERTIDO</span><strong>{money(total)}</strong></div>
      <button type="button" className="btn btn-primary iv-confirm" disabled={!canSubmit} onClick={() => { setSaveError(""); setReview(true); }}>{confirmed && !dirty ? <><Icon name="check" size={18} /> cartera confirmada</> : <>revisar inversión <Icon name="arrow" size={18} /></>}</button>
      <p className="iv-summary-hint" aria-live="polite">{remaining > 0 ? `Repartí los ${money(remaining)} restantes para confirmar.` : confirmed && !dirty ? "Tu inversión ya está incluida en los resultados." : "Todo asignado. Tu próximo paso: confirmar."}</p>
      {selected.length > 0 && !readOnly && <button type="button" className="iv-reset" onClick={() => { setAllocations({}); setSuccess(false); }}>limpiar distribución</button>}
      {dirty && confirmed && <p className="iv-unsaved">Tenés cambios sin confirmar. El ranking conserva tu última cartera.</p>}
    </div><div className="iv-summary-foot"><Icon name="lock" size={13} /> Tu equipo no puede recibir tu inversión.</div></aside></div>
    <div className="iv-mobile-balance"><div><span>DISPONIBLE</span><strong>{money(remaining)}</strong></div><button className="btn btn-primary btn-sm" type="button" disabled={!canSubmit} onClick={() => { setSaveError(""); setReview(true); }}>revisar <Icon name="arrow" size={16} /></button></div>
    <dialog ref={dialog} className="iv-dialog" onCancel={(event) => { if (saving) event.preventDefault(); }} onClose={() => setReview(false)}><div className="iv-dialog-head"><span className="iv-label">03 / EL PRÓXIMO IMPULSO</span><button type="button" aria-label="Cerrar revisión" disabled={saving} onClick={() => setReview(false)}><Icon name="close" /></button></div><h2>hacé tu apuesta<span className="iv-blue">.</span></h2><p>Así queda tu millón. {confirmed ? "Esta cartera reemplaza tu inversión anterior." : "Al confirmar, tus inversiones se suman al ranking."}</p><div className="iv-review-list">{selected.map((team) => <div key={team.id}><span>{team.name}</span><strong>{money(allocations[team.id])}</strong></div>)}<div className="iv-review-total"><span>total</span><strong>{money(total)}</strong></div></div>{saveError && <p className="iv-error" role="alert">{saveError}</p>}<button type="button" className="btn btn-primary iv-confirm" disabled={saving || !canSubmit} onClick={() => void confirm()}>{saving ? "guardando inversión…" : "confirmar mi inversión"}<Icon name="arrow" size={18} /></button><button type="button" className="iv-dialog-back" disabled={saving} onClick={() => setReview(false)}>← seguir ajustando</button></dialog>
  </>;
}
