"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "./useInView";

type Cell = { x: number; y: number; inside: boolean; ch: string; at: number; blue: number; set: boolean };

// fondo: caracteres de código; adentro del texto: bits (build 101)
const CHARS = "{}<>/=+*#;:$_build".split("");
const BITS = ["0", "1"];
const CW = 9; // ancho de celda (px)
const CH = 12; // alto de celda (px)
const RADIUS = 64; // radio del puntero (px)

const pick = (set: string[]) => set[(Math.random() * set.length) | 0];

/** Campo de caracteres mono que se "decodifica" en un texto (una o más
 *  líneas) armado con 0 y 1. Cerca del puntero los caracteres se desordenan y
 *  se vuelven azules. Arranca al entrar en pantalla y se detiene al salir;
 *  con reduced motion queda quieto y resuelto. Colores y fuente salen de los
 *  tokens del CSS (--fg, --faint, --accent-text, --font-mono-stack). */
export function GlyphField({
  lines,
  label,
  className = "",
}: {
  lines: string[];
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const text = lines.join("\n");

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const still = reducedMotion();
    const rows = text.split("\n");

    const css = getComputedStyle(cv);
    const family = css.fontFamily;
    const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
    const FG = color("--fg", "#ffffff");
    const FAINT = color("--faint", "#878b96");
    const BLUE = color("--accent-text", "#6aa9ff");

    let cells: Cell[] = [];
    let W = 0;
    let H = 0;
    let t0 = 0;
    let px = -999;
    let py = -999;
    let raf = 0;
    let last = 0;
    let visible = false;
    let started = false;

    const layout = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth;
      H = cv.clientHeight;
      if (!W || !H) return;
      cv.width = W * dpr;
      cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // máscara: el texto centrado, con un trazo extra para que cada línea
      // tenga varias celdas de ancho y se lea
      const m = document.createElement("canvas");
      m.width = W;
      m.height = H;
      const mc = m.getContext("2d");
      if (!mc) return;
      mc.font = `600 100px ${family}`;
      const widest = Math.max(...rows.map((r) => mc.measureText(r).width));
      const size = Math.min((100 * W * 0.76) / widest, (H * 0.8) / (0.72 + (rows.length - 1) * 0.92));
      mc.font = `600 ${size}px ${family}`;
      mc.fillStyle = mc.strokeStyle = "#000";
      mc.lineWidth = size * 0.09;
      mc.lineJoin = "round";
      mc.textBaseline = "alphabetic";
      const top = (H - (0.72 + (rows.length - 1) * 0.92) * size) / 2;
      rows.forEach((r, i) => {
        const x = (W - mc.measureText(r).width) / 2;
        const y = top + 0.72 * size + i * 0.92 * size;
        mc.fillText(r, x, y);
        mc.strokeText(r, x, y);
      });
      const alpha = mc.getImageData(0, 0, W, H).data;

      cells = [];
      for (let y = 0; y + CH <= H; y += CH) {
        for (let x = 0; x + CW <= W; x += CW) {
          const a = alpha[(((y + CH / 2) | 0) * W + ((x + CW / 2) | 0)) * 4 + 3];
          cells.push({ x, y, inside: a > 100, ch: pick(CHARS), at: 150 + Math.random() * 1100, blue: 0, set: false });
        }
      }
      if (still) cells.forEach((c) => c.inside && ((c.ch = pick(BITS)), (c.set = true)));
    };

    const draw = (now: number) => {
      const t = still ? Infinity : now - t0;
      ctx.clearRect(0, 0, W, H);
      ctx.font = `500 10px ${family}`;
      ctx.textBaseline = "top";
      for (const c of cells) {
        const dx = c.x + CW / 2 - px;
        const dy = c.y + CH / 2 - py;
        const near = !still && dx * dx + dy * dy < RADIUS * RADIUS;
        if (near) {
          c.blue = 1;
          c.set = false;
          if (Math.random() < 0.35) c.ch = pick(CHARS);
        } else {
          c.blue *= 0.9;
        }
        const settled = t > c.at;
        if (!still) {
          if (c.inside && !settled && Math.random() < 0.4) c.ch = pick(CHARS);
          if (c.inside && settled && (!c.set || (c.blue < 0.05 && Math.random() < 0.002))) {
            c.ch = pick(BITS);
            c.set = true;
          }
          if (!c.inside && Math.random() < 0.003) c.ch = pick(CHARS);
        }
        if (c.blue > 0.05) {
          ctx.fillStyle = BLUE;
          ctx.globalAlpha = 0.35 + 0.65 * c.blue;
        } else if (c.inside) {
          ctx.fillStyle = FG;
          ctx.globalAlpha = settled ? 0.95 : 0.3;
        } else {
          ctx.fillStyle = FAINT;
          ctx.globalAlpha = 0.14;
        }
        ctx.fillText(c.ch, c.x, c.y);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 33) return; // ~30 fps alcanza
      last = now;
      draw(now);
    };
    const play = () => {
      if (still) return draw(0);
      if (!started) {
        started = true;
        t0 = performance.now(); // la decodificación arranca al entrar en pantalla
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
    };
    const onLeave = () => {
      px = py = -999;
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else cancelAnimationFrame(raf);
    });
    const ro = new ResizeObserver(() => {
      layout();
      if (visible || still) draw(performance.now());
    });

    let alive = true;
    // la máscara necesita la mono cargada; si no, mide con la de respaldo
    (document.fonts?.load(`600 100px ${family}`) ?? Promise.resolve()).finally(() => {
      if (!alive) return;
      layout();
      ro.observe(cv);
      io.observe(cv);
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
    };
  }, [text]);

  return <canvas ref={ref} className={`glyph-field ${className}`.trim()} role="img" aria-label={label} />;
}
