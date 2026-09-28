"use client";

import { useEffect } from "react";

/** Escribe la posición del puntero en --x/--y de la tarjeta `.path` que está
 *  debajo, para el spotlight de globals.css. Un solo listener delegado; solo
 *  con puntero fino (mouse/trackpad), en touch no hace nada. */
export function PointerSpot() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.<HTMLElement>(".path");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
