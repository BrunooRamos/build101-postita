"use client";

import { useState } from "react";
import { CANONICAL_URL } from "../event";

const SHARE_TEXT = `build 101: la hackathon de IA más grande de Uruguay. 17 y 18 de octubre. ${CANONICAL_URL}`;

export function ShareLinks() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CANONICAL_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin permiso de portapapeles: no hacemos nada
    }
  };

  return (
    <span className="share">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        compartir por WhatsApp ↗
      </a>
      <span aria-hidden> · </span>
      <button type="button" onClick={copy}>
        {copied ? "enlace copiado ✓" : "copiar enlace"}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "enlace copiado" : ""}
      </span>
    </span>
  );
}
