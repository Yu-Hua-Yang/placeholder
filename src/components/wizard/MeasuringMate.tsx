"use client";

import type { ReactElement } from "react";

type Pose = "idle" | "wave" | "run" | "search" | "present" | "think";

interface MeasuringMateProps {
  pose?: Pose;
  size?: number;
  className?: string;
}

const PALETTE: Record<string, string> = {
  b: "#93C5FD", // body blue-300
  d: "#60A5FA", // body shadow blue-400
  w: "#DBEAFE", // body highlight blue-100
  h: "#EFF6FF", // bright highlight blue-50
  e: "#0F172A", // eyes
  p: "#FFFFFF", // eye shine
  m: "#0F172A", // mouth
  a: "#94A3B8", // arms slate-400
  s: "#CBD5E1", // hands slate-300
  l: "#94A3B8", // legs
  f: "#E2E8F0", // feet slate-200
  t: "#FBBF24", // tape amber-400 (brighter)
  k: "#DC2626", // tape marks red-600 (high contrast)
  g: "#F59E0B", // magnifying glass
  o: "#FBBF24", // glass ring amber-300
  c: "#E0F2FE", // glass lens light
};

// 24 cols × 24 rows per pose
const POSES: Record<Pose, string[]> = {
  idle: [
    "........bbbbbbbb........",
    "......wwbbbbbbdddd......",
    ".....wwwbbbbbbbbddd.....",
    "....wwbbbbbbbbbbdddd....",
    "....wbbbbbbbbbbbdddd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbepebbbbepebdd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbbbbbbbbbbdddd....",
    ".....wbbbbmmmmbbddd.....",
    ".....wbbbbbbbbbbddd.....",
    "......bbbbttttbbdd......",
    "......bbbbtktbbbdd......",
    "......bbbbttbbbbdd......",
    "...a..bbbbbbbbbb..a.....",
    "...a...bbbbbbbb...a.....",
    "...s....bbbbbb....s.....",
    ".........bbbb...........",
    "..........bb............",
    ".........l..l...........",
    ".........l..l...........",
    "........ll..ll..........",
    ".......fff..fff.........",
    "........................",
  ],
  wave: [
    "....................aa..",
    "........bbbbbbbb...a....",
    "......wwbbbbbbdddd......",
    ".....wwwbbbbbbbbddd.....",
    "....wwbbbbbbbbbbdddd....",
    "....wbbbbbbbbbbbdddd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbepebbbbepebdd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbbbbbbbbbbdddd....",
    ".....wbbbbmmmmbbddd.....",
    ".....wbbbbbbbbbbddd.....",
    "......bbbbttttbbdd......",
    "......bbbbtktbbbdd......",
    "...a..bbbbttbbbbdd......",
    "...a...bbbbbbbbbb.......",
    "...s....bbbbbb..........",
    ".........bbbb...........",
    "..........bb............",
    ".........l..l...........",
    ".........l..l...........",
    "........ll..ll..........",
    ".......fff..fff.........",
    "........................",
  ],
  run: [
    "........bbbbbbbb........",
    "......wwbbbbbbdddd......",
    ".....wwwbbbbbbbbddd.....",
    "....wwbbbbbbbbbbdddd....",
    "....wbbbbbbbbbbbdddd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbepebbbbepebdd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbbbbbbbbbbdddd....",
    ".....wbbbbmmmmbbddd.....",
    ".....wbbbbbbbbbbddd.....",
    "......bbbbttttbbdd......",
    "..a...bbbbtktbbbdd..a...",
    "..a...bbbbttbbbbdd..a...",
    "..s....bbbbbbbbbb..s....",
    ".......bbbbbbbbbb.......",
    "........bbbbbbbb........",
    ".........bbbb...........",
    "......l........l........",
    ".....ll........ll.......",
    "....fff........fff......",
    "........................",
    "........................",
    "........................",
  ],
  search: [
    "........bbbbbbbb........",
    "......wwbbbbbbdddd......",
    ".....wwwbbbbbbbbddd.....",
    "....wwbbbbbbbbbbdddd....",
    "....wbbbbbbbbbbbdddd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbepebbbbepebdd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbbbbbbbbbbdddd....",
    ".....wbbbbmmmmbbddd.....",
    ".....wbbbbbbbbbbddd.....",
    "......bbbbttttbbdd.a....",
    "......bbbbtktbbbdd.a....",
    "...a..bbbbttbbbbddooo...",
    "...a...bbbbbbbbbbocooo..",
    "...s....bbbbbb...occco..",
    ".........bbbb....ocooo..",
    "..........bb......ooo...",
    "..........l.l...........",
    "..........l.l...........",
    ".........ll.ll..........",
    "........fff.fff.........",
    "........................",
    "........................",
  ],
  present: [
    "........bbbbbbbb........",
    "......wwbbbbbbdddd......",
    ".....wwwbbbbbbbbddd.....",
    "....wwbbbbbbbbbbdddd....",
    "....wbbbbbbbbbbbdddd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbepebbbbepebdd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbbbbbbbbbbdddd....",
    ".....wbbbmmmmmmbbddd....",
    ".....wbbbbbbbbbbddd.....",
    "......bbbbttttbbdd......",
    "......bbbbtktbbbdd......",
    "......bbbbttbbbbdd......",
    ".a.....bbbbbbbbbb.....a.",
    ".a......bbbbbbbb......a.",
    ".s.......bbbbbb.......s.",
    "..........bbbb..........",
    "...........bb...........",
    ".........l....l.........",
    ".........l....l.........",
    "........ll....ll........",
    ".......fff....fff.......",
    "........................",
  ],
  think: [
    "........bbbbbbbb........",
    "......wwbbbbbbdddd......",
    ".....wwwbbbbbbbbddd.....",
    "....wwbbbbbbbbbbdddd....",
    "....wbbbbbbbbbbbdddd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbepebbbbepebdd....",
    "....wbbeeebbbbeeebdd....",
    "....wbbbbbbbbbbbdddd....",
    ".....wbbbbmmmmbbddd.....",
    ".....wbbbbbbbbbbddd.....",
    "......bbbbttttbbdd......",
    ".a....bbbbtktbbbdd......",
    ".a....bbbbttbbbbdd..a...",
    ".a.....bbbbbbbbbb..a....",
    "..s.....bbbbbbbb...s....",
    ".........bbbbbb.........",
    "..........bbbb..........",
    "...........bb...........",
    ".........l..l...........",
    ".........l..l...........",
    "........ll..ll..........",
    ".......fff..fff.........",
    "........................",
  ],
};

const ANIM_CLASS: Record<Pose, string> = {
  idle: "pixel-bounce",
  wave: "pixel-wave",
  run: "pixel-run",
  search: "pixel-search",
  present: "pixel-present",
  think: "pixel-bounce",
};

const resolveColor = (ch: string): string | null => {
  if (ch === "m") return PALETTE.e;
  return PALETTE[ch] ?? null;
};

const isTapePixel = (ch: string): boolean => ch === "t" || ch === "k";

export default function MeasuringMate({
  pose = "idle",
  size = 3,
  className = "",
}: MeasuringMateProps) {
  const grid = POSES[pose];
  const rows = grid.length;
  const cols = grid[0].length;

  const bodyPixels: ReactElement[] = [];
  const tapePixels: ReactElement[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = grid[r][c];
      const color = resolveColor(ch);
      if (color) {
        const el = (
          <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill={color} />
        );
        if (isTapePixel(ch)) {
          tapePixels.push(el);
        } else {
          bodyPixels.push(el);
        }
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols} ${rows}`}
      width={cols * size}
      height={rows * size}
      className={`${ANIM_CLASS[pose]} ${className}`}
      style={{ imageRendering: "pixelated" }}
      role="img"
      aria-label="Measuring Mate mascot"
    >
      {bodyPixels}
      <g className="tape-glow">
        {tapePixels}
      </g>
    </svg>
  );
}
