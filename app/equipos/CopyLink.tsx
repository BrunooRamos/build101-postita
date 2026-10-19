"use client";

import { useState } from "react";

// Copia el link directo al equipo (/equipos/07) para pasarlo por WhatsApp,
// a los jueces o a la familia.
export function CopyLink({ path, label }: { path: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="eq-copy"
      aria-label={`copiar el link de ${label}`}
      onClick={async () => {
        const url = `${window.location.origin}${path}`;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          window.prompt("copiá el link", url);
          return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? "✓ link copiado" : "copiar link"}
    </button>
  );
}
