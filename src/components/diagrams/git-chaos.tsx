import type { CSSProperties } from "react";
import { hash } from "./iso";

const COLS = 42;
const ROWS = 7;
const CELL = 10;
const GAP = 3;
const GRID_X = 7;
const GRID_Y = 30;

const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
  const h = hash(i + 7);
  const level = h < 0.08 ? 3 : h < 0.18 ? 2 : h < 0.3 ? 1 : 0;
  return {
    x: GRID_X + Math.floor(i / ROWS) * (CELL + GAP),
    y: GRID_Y + (i % ROWS) * (CELL + GAP),
    level,
    twinkle: level > 0 && hash(i + 101) < 0.35,
    delay: hash(i + 211) * 2.4,
  };
});

const LEVEL_CLASS = [
  "fill-foreground/5",
  "fill-(--brand)/15",
  "fill-(--brand)/30",
  "fill-(--brand)/55",
];

const branches = [
  {
    d: "M110 75 C135 75, 130 35, 155 35 H255 C280 35, 275 75, 300 75",
    delay: 350,
    accent: true,
  },
  { d: "M200 75 C225 75, 220 115, 245 115 H330", delay: 600, accent: false },
  {
    d: "M400 75 C420 75, 415 30, 440 30 C462 30, 458 75, 480 75",
    delay: 900,
    accent: true,
  },
];

const commits = [
  { x: 40, y: 75, delay: 100 },
  { x: 110, y: 75, delay: 250 },
  { x: 170, y: 35, delay: 650 },
  { x: 200, y: 75, delay: 420 },
  { x: 230, y: 35, delay: 800 },
  { x: 260, y: 115, delay: 900 },
  { x: 300, y: 75, delay: 1050 },
  { x: 315, y: 115, delay: 1050 },
  { x: 400, y: 75, delay: 780 },
  { x: 440, y: 30, delay: 1250 },
  { x: 480, y: 75, delay: 1400 },
];

const labels = [
  { x: 155, y: 21, text: "feat/bots", accent: true, delay: 900 },
  { x: 245, y: 134, text: "exp/rewrite", accent: false, delay: 1100 },
  { x: 386, y: 128, text: "wip?", accent: false, delay: 1500 },
  { x: 440, y: 16, text: "yolo", accent: true, delay: 1400 },
  { x: 530, y: 55, text: "HEAD", accent: true, delay: 1700 },
];

function delay(ms: number) {
  return { "--git-delay": `${ms}ms` } as CSSProperties;
}

export function GitChaos() {
  return (
    <svg
      viewBox="0 0 560 150"
      aria-hidden="true"
      focusable="false"
      className="h-auto w-full overflow-visible"
    >
      <defs>
        <linearGradient id="git-chaos-fade">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.2" stopColor="white" />
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <mask id="git-chaos-mask">
          <rect width="560" height="150" fill="url(#git-chaos-fade)" />
        </mask>
      </defs>

      <g mask="url(#git-chaos-mask)" className="git-fade" style={delay(0)}>
        {cells.map(({ x, y, level, twinkle, delay: d }) => (
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            rx="2"
            className={twinkle ? "iso-dot-lit" : LEVEL_CLASS[level]}
            style={twinkle ? { animationDelay: `-${d.toFixed(2)}s` } : undefined}
          />
        ))}
      </g>

      <path
        d="M16 75 H530"
        pathLength={1}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="git-draw stroke-foreground/40"
        style={delay(0)}
      />
      {branches.map(({ d, delay: ms, accent }) => (
        <path
          key={d}
          d={d}
          pathLength={1}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          className={`git-draw ${accent ? "stroke-(--brand)" : "stroke-foreground/30"}`}
          style={delay(ms)}
        />
      ))}
      <path
        d="M330 115 C350 115, 355 128, 378 126"
        fill="none"
        strokeWidth="2"
        strokeDasharray="3 4"
        strokeLinecap="round"
        className="git-fade stroke-foreground/30"
        style={delay(1300)}
      />

      {commits.map(({ x, y, delay: ms }) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="5"
          strokeWidth="2"
          className="git-pop fill-background stroke-foreground/55"
          style={delay(ms)}
        />
      ))}

      <circle cx="530" cy="75" r="7" className="iso-ripple" />
      <circle
        cx="530"
        cy="75"
        r="7"
        className="git-pop fill-(--brand)"
        style={delay(1600)}
      />

      {labels.map(({ x, y, text, accent, delay: ms }) => (
        <text
          key={text}
          x={x}
          y={y}
          fontSize="10"
          textAnchor={x > 500 ? "middle" : "start"}
          dominantBaseline="central"
          data-tone={accent ? "accent" : "muted"}
          className="iso-label git-fade"
          style={delay(ms)}
        >
          {text}
        </text>
      ))}
    </svg>
  );
}
