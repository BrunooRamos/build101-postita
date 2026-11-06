"use client";

import { useEffect, useRef } from "react";
import { AFTERMOVIE } from "../event";

// Arranca solo apenas el player entra en pantalla y se pausa al salir. Los
// navegadores solo dejan autoplay en silencio, así que arranca muted: el
// sonido se prende desde los controles. Con "reducir movimiento" no arranca
// solo. preload="none" mantiene la landing liviana hasta que el video se ve.
export function AftermovieVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // si la persona lo pausa a mano, no lo volvemos a arrancar al scrollear
    let pausedByUser = false;
    let pausingFromObserver = false;
    const onPause = () => {
      if (!pausingFromObserver && !video.ended) pausedByUser = true;
      pausingFromObserver = false;
    };
    const onPlay = () => {
      pausedByUser = false;
    };
    video.addEventListener("pause", onPause);
    video.addEventListener("play", onPlay);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (pausedByUser || video.ended) return;
          video.muted = true;
          video.play().catch(() => {});
        } else if (!video.paused) {
          pausingFromObserver = true;
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);

    return () => {
      observer.disconnect();
      video.removeEventListener("pause", onPause);
      video.removeEventListener("play", onPlay);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="aftermovie-video"
      src={AFTERMOVIE.src}
      poster={AFTERMOVIE.poster}
      controls
      muted
      playsInline
      preload="none"
      width={1920}
      height={1080}
      aria-label="after movie de build 101"
    />
  );
}
