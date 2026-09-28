"use client";

import { useEffect, useRef } from "react";

/** Thin top progress bar that tracks scroll depth.
 *  Donde hay scroll-driven animations la barra es CSS puro (fx.css
 *  .scroll-bar); este listener queda solo como respaldo para el resto. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (CSS.supports?.("animation-timeline: scroll()")) return;
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div ref={bar} className="scroll-bar" />;
}
