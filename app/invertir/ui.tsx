"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../components/Logo";
import { INVESTMENT_GAME } from "@/lib/investment-game";

export function Icon({ name, size = 20 }: { name: "arrow" | "lock" | "check" | "chart" | "wallet" | "close"; size?: number }) {
  const paths = {
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="1" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chart: <><path d="M4 4v16h16M8 15l4-5 4 2 5-7" /></>,
    wallet: <><path d="M20 8V5H4v15h16V8H4M16 12h6v5h-6z" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">{paths[name]}</svg>;
}

export function TeamMark({ index, large = false }: { index: number; large?: boolean }) {
  const patterns = [
    [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
    [2, 6, 7, 8, 10, 11, 12, 13, 14, 16, 17, 18, 22],
    [0, 1, 2, 3, 4, 5, 9, 10, 12, 14, 15, 19, 20, 21, 22, 23, 24],
    [2, 7, 10, 11, 12, 13, 14, 17, 22],
    [1, 2, 3, 5, 9, 10, 14, 15, 19, 21, 22, 23],
    [0, 4, 6, 8, 12, 16, 18, 20, 24],
    [1, 2, 3, 5, 9, 10, 12, 14, 15, 19, 21, 22, 23],
    [2, 6, 8, 10, 12, 14, 16, 18, 22],
    [0, 1, 5, 6, 12, 18, 19, 23, 24],
    [0, 2, 4, 7, 10, 11, 12, 13, 14, 17, 20, 22, 24],
  ];
  return <svg className={`iv-mark ${large ? "iv-mark-lg" : ""}`} viewBox="0 0 29 29" fill="currentColor" aria-hidden="true">{patterns[index % patterns.length].map((cell) => <rect key={cell} x={(cell % 5) * 6} y={Math.floor(cell / 5) * 6} width="5" height="5" />)}</svg>;
}

export function InvestmentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const results = pathname.endsWith("/resultados");
  return <div className="iv-app">
    <header className="iv-nav"><div className="wrap iv-nav-inner">
      <Link href="/" aria-label="build 101, inicio"><Logo /></Link>
      <span className="iv-nav-divider" />
      <Link href="/invertir" className="iv-wordmark">la ronda<span className="iv-blue">_</span></Link>
      <span className="iv-nav-status"><span className="iv-live-dot" /> {INVESTMENT_GAME.demo ? "MODO DEMO" : INVESTMENT_GAME.open ? "RONDA ABIERTA" : "RONDA CERRADA"}</span>
      <Link href="/" className="iv-back">volver al evento ↗</Link>
    </div></header>
    <div className="iv-subnav"><nav className="wrap iv-tabs" aria-label="juego de inversión">
      <Link href="/invertir" className={!results ? "active" : ""} aria-current={!results ? "page" : undefined}><Icon name="wallet" size={17} /> mi cartera</Link>
      <Link href="/invertir/resultados" className={results ? "active" : ""} aria-current={results ? "page" : undefined}><Icon name="chart" size={17} /> resultados <span className="iv-tab-dot" /></Link>
      <span className="iv-tabs-note">CAPITAL FICTICIO. IDEAS REALES.</span>
    </nav></div>
    <main className="wrap iv-main">{children}</main>
    <footer className="wrap iv-footer"><span>build 101 <span className="iv-dim">/</span> la ronda</span><span>build. ship. invest.</span><span>MONTEVIDEO, 2026 <span className="iv-blue">↗</span></span></footer>
  </div>;
}
