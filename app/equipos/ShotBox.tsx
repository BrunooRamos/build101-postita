"use client";

import { useState } from "react";

// La ventanita de navegador del equipo: la captura del demo (o la portada del
// pitch, o la tarjeta del repo) y, si subieron video, un play que lo reproduce
// ahí mismo, en el mismo marco.
export function ShotBox({
  image,
  label,
  href,
  video,
  name,
}: {
  image: string;
  label: string;
  href: string | null;
  video: string | null;
  name: string;
}) {
  const [playing, setPlaying] = useState(false);
  const bar = (
    <span className="eq-shot-bar">
      <i />
      <i />
      <i />
      <span>{label}</span>
    </span>
  );

  if (video) {
    return (
      <div className="eq-shot">
        {bar}
        <div className="eq-shot-media">
          {playing ? (
            <iframe src={video} title={`video de ${name}`} allow="autoplay; fullscreen" allowFullScreen />
          ) : (
            <button type="button" className="eq-play" onClick={() => setPlaying(true)} aria-label={`ver el video de ${name}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" width={1200} height={750} loading="lazy" />
              <span className="eq-play-btn" aria-hidden>
                ▶ ver video
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const img = (
    <span className="eq-shot-media">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" width={1200} height={750} loading="lazy" />
    </span>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="eq-shot" tabIndex={-1} aria-hidden>
      {bar}
      {img}
    </a>
  ) : (
    <div className="eq-shot" aria-hidden>
      {bar}
      {img}
    </div>
  );
}
