// Bloques pixel azules (guiño a Next.js Conf): celdas sólidas, a cuadros y
// punteadas sobre una grilla. Puramente decorativo. Cada instancia recibe un
// `id` para que los <pattern> del SVG no choquen entre sí.

type Cell = [x: number, y: number, kind: "solid" | "check" | "dots"];

export const PIXELS_HERO: Cell[] = [
  [5, 0, "check"],
  [7, 0, "check"],
  [6, 1, "solid"],
  [4, 1, "dots"],
  [7, 2, "check"],
  [6, 3, "check"],
  [7, 4, "solid"],
  [0, 5, "solid"],
  [1, 6, "check"],
  [0, 7, "check"],
  [2, 7, "solid"],
];

export const PIXELS_TEAM: Cell[] = [
  [0, 0, "solid"],
  [1, 0, "check"],
  [0, 1, "check"],
  [6, 5, "check"],
  [7, 5, "solid"],
  [7, 6, "check"],
  [5, 7, "solid"],
  [6, 7, "check"],
  [7, 7, "dots"],
];

export const PIXELS_SMALL: Cell[] = [
  [2, 0, "solid"],
  [3, 0, "check"],
  [3, 1, "solid"],
  [1, 1, "check"],
  [2, 2, "check"],
  [3, 3, "dots"],
];

export function PixelBlocks({
  id,
  cells,
  cols = 8,
  rows = 8,
  className = "",
}: {
  id: string;
  cells: Cell[];
  cols?: number;
  rows?: number;
  className?: string;
}) {
  const u = 10;
  return (
    <svg
      className={`pixels ${className}`}
      viewBox={`0 0 ${cols * u} ${rows * u}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      focusable="false"
    >
      <defs>
        <pattern id={`${id}-check`} width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="var(--pixel)" />
          <rect x="1" y="1" width="1" height="1" fill="var(--pixel)" />
        </pattern>
        <pattern id={`${id}-dots`} width="2.5" height="2.5" patternUnits="userSpaceOnUse">
          <rect width="1.25" height="1.25" fill="var(--pixel)" />
        </pattern>
      </defs>
      {cells.map(([x, y, kind]) => (
        <rect
          key={`${x}-${y}`}
          x={x * u}
          y={y * u}
          width={u}
          height={u}
          fill={kind === "solid" ? "var(--pixel)" : `url(#${id}-${kind})`}
        />
      ))}
    </svg>
  );
}
