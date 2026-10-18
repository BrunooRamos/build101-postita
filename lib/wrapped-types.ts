// build 101 wrapped — forma de metrics.json. Lo escribe el script de ingesta
// (scripts/wrapped/metrics.ts) ya agregado y filtrado; la página /wrapped solo
// lo lee. Nada de emails ni nombres de personas: solo equipos.

export type TeamCount = { team: string; count: number };
export type Ranked = { name: string; teams: number };
/** Un commit que se puede mostrar en pantalla (ya pasó por hidden.json y el
 *  filtro de insultos). `message` es null cuando el texto no se puede mostrar. */
export type ShownCommit = { team: string; time: string; message: string | null };

export type WrappedMetrics = {
  version: 1;
  generatedAt: string;
  /** true en el archivo de ejemplo: la página lo avisa en el pie. */
  sample?: boolean;
  window: { kickoff: string; freeze: string; venueClose: string };
  totals: {
    commits: number;
    linesAdded: number;
    linesDeleted: number;
    files: number;
    builders: number;
    repos: number;
    teams: number;
    prs: number;
  };
  /** Commits por hora (hora de Uruguay), una fila por día del evento. */
  heatmap: { days: { label: string; hours: (number | null)[] }[]; max: number };
  peak: { day: string; hour: number; count: number } | null;
  owl: (ShownCommit & { afterHours: number }) | null;
  earlyBird: ShownCommit | null;
  lastMinute: { minutes: number; count: number; teams: number };
  sleepless: { team: string; longestRestMin: number; nightCommits: number } | null;
  fastStart: { team: string; minutes: number } | null;
  monster: { team: string; lines: number; added: number; deleted: number; files: number; message: string | null } | null;
  words: { word: string; count: number }[];
  counters: { label: string; count: number }[];
  longest: { team: string; message: string; chars: number } | null;
  shortest: { team: string; message: string; chars: number } | null;
  funny: { team: string; message: string }[];
  ai: { coauthored: number; total: number; byAgent: { agent: string; count: number }[] };
  providers: Ranked[];
  models: Ranked[];
  languages: { name: string; pct: number }[];
  frameworks: Ranked[];
  teams: { team: string; commits: number; finalista: boolean }[];
  balanced: { team: string; shares: number[]; commits: number } | null;
};
