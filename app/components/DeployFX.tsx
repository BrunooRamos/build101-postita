"use client";

import { useEffect, useRef, useState } from "react";
import { SPIN, reducedMotion } from "./useInView";
import { fireConfetti } from "./confetti";
import { APPLY_OPEN, APPLY_PATH, APPLY_CLOSED_LABEL } from "../event";

const STEPS = [
  { run: "building…", ok: "compiled ✓", ms: 650 },
  { run: "running tests…", ok: "5 passed ✓", ms: 650 },
  { run: "abriendo inscripción…", ok: "redirect → /inscripcion ✓", ms: 800 },
];

function openApply() {
  window.location.assign(APPLY_PATH);
}

/** Listens for `uru:deploy` and plays a fake CI pipeline before opening the form. */
export function DeployFX() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // index running; STEPS.length = live
  const [frame, setFrame] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 80);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onDeploy = () => {
      // guardia: con las inscripciones cerradas no hay a dónde redirigir.
      if (!APPLY_OPEN) return;
      if (busy.current) return;
      busy.current = true;

      if (reducedMotion()) {
        busy.current = false;
        openApply();
        return;
      }

      setStep(0);
      setOpen(true);
      const timers: ReturnType<typeof setTimeout>[] = [];
      let acc = 0;
      STEPS.forEach((s, i) => {
        acc += s.ms;
        timers.push(setTimeout(() => setStep(i + 1), acc));
      });
      // LIVE moment
      timers.push(
        setTimeout(() => {
          fireConfetti({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        }, acc + 60),
      );
      timers.push(
        setTimeout(() => {
          setOpen(false);
          busy.current = false;
          openApply();
        }, acc + 1100),
      );
    };
    window.addEventListener("uru:deploy", onDeploy);
    return () => window.removeEventListener("uru:deploy", onDeploy);
  }, []);

  if (!open) return null;
  const spin = SPIN[frame % SPIN.length];
  const live = step >= STEPS.length;

  return (
    <div className="deploy-overlay" aria-hidden>
      <div className="deploy-card">
        <div className="deploy-head">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>
          <span className="win-title">deploy · build101.dev</span>
          <span className="win-tag">CI</span>
        </div>
        <div className="deploy-body">
          {STEPS.map((s, i) => {
            const passed = i < step;
            const running = i === step && !live;
            return (
              <div className="deploy-step" key={s.run}>
                {passed ? (
                  <span className="tick pop">✓</span>
                ) : running ? (
                  <span className="spin-glyph ci-spin">{spin}</span>
                ) : (
                  <span className="tick pending">·</span>
                )}
                <span style={{ opacity: passed || running ? 1 : 0.4 }}>
                  {passed ? s.ok : s.run}
                </span>
              </div>
            );
          })}
          <div className={`deploy-live ${live ? "on" : ""}`}>
            <span className="live-dot" />{" "}
            {live ? "abriendo inscripción…" : "esperando deploy…"}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Anchor that triggers the deploy pipeline instead of a plain jump.
 *  Con `APPLY_OPEN` en false no linkea a ningún lado: se convierte en un
 *  cartel de "inscripciones cerradas" (mismo lugar en nav, hero, footer y CTA). */
export function InscribiteBtn({
  children,
  className = "btn",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!APPLY_OPEN) {
    return (
      <span className={`${className} apply-soon`.trim()} aria-disabled="true">
        {APPLY_CLOSED_LABEL}
      </span>
    );
  }

  // una ↗ final va en su propio span: se mueve sola al hover y no se lee
  // en voz alta ("flecha noreste").
  const label =
    typeof children === "string" && children.endsWith(" ↗") ? (
      <>
        {children.slice(0, -2)}{" "}
        <span className="arr" aria-hidden>
          ↗
        </span>
      </>
    ) : (
      children
    );

  return (
    <a
      href={APPLY_PATH}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("uru:deploy"));
      }}
    >
      {label}
    </a>
  );
}
