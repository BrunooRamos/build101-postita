"use client";

import { useEffect, useRef, useState } from "react";
import { SPIN } from "./useInView";

type Phase = "error" | "fixing" | "fixed" | null;

/** Easter egg: a fake Next.js error overlay that auto-fixes itself with a commit. */
export function FakeCrash() {
  const [phase, setPhase] = useState<Phase>(null);
  const [frame, setFrame] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 80);
    return () => clearInterval(id);
  }, []);

  const close = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase(null);
  };

  useEffect(() => {
    const onCrash = () => {
      timers.current.forEach(clearTimeout);
      setPhase("error");
      timers.current = [
        setTimeout(() => setPhase("fixing"), 2200),
        setTimeout(() => setPhase("fixed"), 3600),
        setTimeout(() => setPhase(null), 4900),
      ];
    };
    window.addEventListener("uru:crash", onCrash);
    return () => {
      window.removeEventListener("uru:crash", onCrash);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // Solo se dispara a pedido (comando `crash` en la terminal): un error que
  // aparece solo al scrollear parece un bug real para sponsors y jurado.

  if (!phase) return null;
  const spin = SPIN[frame % SPIN.length];
  const fixed = phase === "fixed";

  return (
    <div className="crash-overlay" role="dialog" aria-label="error overlay">
      <div className={`crash-modal ${fixed ? "ok" : ""}`}>
        <div className="crash-top">
          <span className="crash-badge">{fixed ? "0 errors" : "1 error"}</span>
          <span className="crash-toptitle">
            {fixed ? "all good — 0 issues" : "unhandled runtime error"}
          </span>
          <button className="crash-x" onClick={close} aria-label="cerrar">
            ✕
          </button>
        </div>

        <div className="crash-main">
          <div className="crash-errname">
            {fixed ? "Error: resuelto ✓" : "Error: too much hype"}
          </div>

          <div className="crash-label">source</div>
          <div className="crash-src">app/page.tsx (42:11) @ build 101</div>
          <pre className="crash-code">
            <span className="cl-dim">  40 | </span>const energy = useHype()
            {"\n"}
            <span className="cl-dim">  41 | </span>if (energy {">"} MAX) {"{"}
            {"\n"}
            <span className={fixed ? "cl-fixed" : "cl-bad"}>
              {fixed ? "  42 |   shipIt() // hype canalizado" : "> 42 |   throw new Error(\"too much hype\")"}
            </span>
            {!fixed && (
              <>
                {"\n"}
                <span className="cl-dim">     | </span>
                <span className="cl-caret">          ^</span>
              </>
            )}
            {"\n"}
            <span className="cl-dim">  43 | </span>{"}"}
          </pre>

          <div className="crash-label">call stack</div>
          <div className="crash-frame">
            build 101 <span>app/page.tsx (42:11)</span>
          </div>
          <div className="crash-frame">
            renderHackathon <span>app/components/Hero.tsx (88:3)</span>
          </div>
        </div>

        <div className="crash-foot">
          {phase === "error" && (
            <span className="cf-muted">● detectando el problema…</span>
          )}
          {phase === "fixing" && (
            <span className="cf-fix">
              <span className="spin-glyph">{spin}</span>{" "}
              git commit -m <span className="spark">&quot;fix: contener el hype&quot;</span> …
            </span>
          )}
          {fixed && (
            <span className="cf-ok">
              ✓ fixed in 1 commit · 0 errors · <span className="spark">deploy o nada</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
