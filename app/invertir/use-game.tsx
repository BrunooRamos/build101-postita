"use client";

import { useCallback, useEffect, useState } from "react";
import { demoPortfolios, INVESTMENT_GAME, INVESTMENT_TEAMS, summarizePortfolios, validatePortfolio, type GameSnapshot, type Portfolio } from "@/lib/investment-game";

const DEMO_KEY = `${INVESTMENT_GAME.roundId}:portfolios`;

function browserPortfolios(): Portfolio[] {
  const portfolios = new Map(demoPortfolios().map((portfolio) => [portfolio.investorId, portfolio]));
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(DEMO_KEY) ?? "[]");
    if (Array.isArray(saved)) for (const item of saved) {
      const valid = validatePortfolio(item);
      if (valid.portfolio) portfolios.set(valid.portfolio.investorId, valid.portfolio);
    }
  } catch { /* A blocked browser store leaves the initial demo visible. */ }
  return [...portfolios.values()];
}

function applyPreview(snapshot: GameSnapshot, investorId?: string): GameSnapshot {
  if (snapshot.storage !== "preview" || !INVESTMENT_GAME.demo) return snapshot;
  const portfolios = browserPortfolios();
  return { ...snapshot, results: summarizePortfolios(portfolios), portfolio: portfolios.find((portfolio) => portfolio.investorId === investorId) ?? null };
}

export function useGame(investorId?: string, poll = false) {
  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadedInvestorId, setLoadedInvestorId] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch(`/api/inversiones${investorId ? `?investorId=${encodeURIComponent(investorId)}` : ""}`, { cache: "no-store", signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No pudimos cargar la ronda.");
      if (signal?.aborted) return;
      setSnapshot(applyPreview(data as GameSnapshot, investorId));
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setError(cause instanceof Error ? cause.message : "No pudimos conectar. Volvé a intentar.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setLoadedInvestorId(investorId ?? "");
      }
    }
  }, [investorId]);

  useEffect(() => {
    const controller = new AbortController();
    const initialRefresh = window.setTimeout(() => void refresh(controller.signal), 0);
    const onUpdate = () => { if (!document.hidden) void refresh(controller.signal); };
    const timer = poll ? window.setInterval(onUpdate, 5000) : undefined;
    window.addEventListener("storage", onUpdate);
    window.addEventListener("investment-saved", onUpdate);
    document.addEventListener("visibilitychange", onUpdate);
    return () => {
      controller.abort();
      window.clearTimeout(initialRefresh);
      window.clearInterval(timer);
      window.removeEventListener("storage", onUpdate);
      window.removeEventListener("investment-saved", onUpdate);
      document.removeEventListener("visibilitychange", onUpdate);
    };
  }, [refresh, poll]);

  const save = async (portfolio: Pick<Portfolio, "investorId" | "allocations">) => {
    let saved: GameSnapshot;
    if (snapshot?.storage === "preview" && INVESTMENT_GAME.demo) {
      const valid = validatePortfolio(portfolio);
      if (!valid.portfolio) throw new Error(valid.error);
      const portfolios = browserPortfolios().filter((previous) => previous.investorId !== portfolio.investorId);
      portfolios.push(valid.portfolio);
      try { localStorage.setItem(DEMO_KEY, JSON.stringify(portfolios)); }
      catch { throw new Error("Tu navegador no permite guardar la demo. Habilitá el almacenamiento e intentá otra vez."); }
      saved = { ...snapshot, results: summarizePortfolios(portfolios), portfolio: valid.portfolio, updatedAt: new Date().toISOString() };
    } else {
      const response = await fetch("/api/inversiones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(portfolio) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No pudimos guardar la inversión.");
      saved = data as GameSnapshot;
    }
    setSnapshot(saved);
    window.dispatchEvent(new Event("investment-saved"));
    return saved;
  };

  return { snapshot, error, loading: loading || loadedInvestorId !== (investorId ?? ""), refresh, save };
}

export function StorageNotice({ snapshot }: { snapshot: GameSnapshot | null }) {
  if (!INVESTMENT_GAME.demo && snapshot?.storage !== "preview") return null;
  return <div className="iv-demo-note"><span className="iv-demo-tag">{INVESTMENT_GAME.demo ? "DEMO" : "VISTA PREVIA"}</span><span>{INVESTMENT_GAME.demo ? INVESTMENT_TEAMS.some((team) => team.teamId === null) ? "Participantes de acreditaciones. Los diez finalistas están a definir. " : "Ronda de prueba con los participantes de acreditaciones. " : ""}{!snapshot ? "Elegí quién sos y armá tu cartera de prueba." : snapshot.storage === "preview" ? INVESTMENT_GAME.demo ? "Lo que guardes se ve en las pestañas de este navegador." : "La ronda todavía no está habilitada para recibir inversiones." : "Los resultados se comparten entre quienes abran esta demo."}</span></div>;
}
