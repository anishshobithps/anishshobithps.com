import type { ReactNode } from "react";
import { cn } from "@repo/ui/lib/cn";

export type InlineArtName = "bot" | "toolbox" | "mug" | "gears" | "pen" | "plane";

const RIM_WIDTH = 1.4;

function gear(cx: number, cy: number, r: number, teeth: number, depth: number) {
  const points: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step - Math.PI / 2;
    for (const [offset, radius] of [
      [-0.3, r - depth],
      [-0.16, r],
      [0.16, r],
      [0.3, r - depth],
    ] as const) {
      const t = a + offset * step;
      points.push(`${(cx + radius * Math.cos(t)).toFixed(2)} ${(cy + radius * Math.sin(t)).toFixed(2)}`);
    }
  }
  return `M${points.join("L")}Z`;
}

interface Paint {
  tint: string;
  deep: string;
  rim: string;
}

function Body({ d, paint, deep = false }: { d: string; paint: Paint; deep?: boolean }) {
  return (
    <path
      d={d}
      fill={`url(#${deep ? paint.deep : paint.tint})`}
      stroke={`url(#${paint.rim})`}
      strokeWidth={RIM_WIDTH}
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
    />
  );
}

function Rim({ d, paint, width = RIM_WIDTH, dashed = false }: { d: string; paint: Paint; width?: number; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={`url(#${paint.rim})`}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      strokeDasharray={dashed ? "2 3" : undefined}
    />
  );
}

function Solid({ d, paint }: { d: string; paint: Paint }) {
  return <path d={d} fill={`url(#${paint.rim})`} />;
}

function Shine({ d }: { d: string }) {
  return <path d={d} className="fill-white opacity-55 dark:opacity-25" />;
}

function Ground({ cx, rx, paint }: { cx: number; rx: number; paint: Paint }) {
  return <ellipse cx={cx} cy={52.5} rx={rx} ry={1.6} fill={`url(#${paint.tint})`} className="opacity-50" />;
}

function Bot({ p }: { p: Paint }) {
  return (
    <>
      <Ground cx={32} rx={17} paint={p} />
      <Rim d="M32 13V8" paint={p} />
      <Body d="M35.5 5.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" paint={p} />
      <Body d="M5 27a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0Z" paint={p} />
      <Body d="M53 27a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0Z" paint={p} />
      <Body d="M22 13h20a11 11 0 0 1 11 11v12a11 11 0 0 1-11 11H22a11 11 0 0 1-11-11V24a11 11 0 0 1 11-11Z" paint={p} />
      <Shine d="M17 18.5c2-2.6 6-3.6 10-3.4.8 0 .8 1.2 0 1.3-3.4.4-6.4 1.4-8.6 3-.9.6-2-.2-1.4-.9Z" />
      <Body d="M23 20h18a6 6 0 0 1 6 6v7a6 6 0 0 1-6 6H23a6 6 0 0 1-6-6v-7a6 6 0 0 1 6-6Z" paint={p} deep />
      <Solid d="M23.5 27.75a2.25 2.25 0 0 1 4.5 0v2.5a2.25 2.25 0 0 1-4.5 0Z" paint={p} />
      <Solid d="M36 27.75a2.25 2.25 0 0 1 4.5 0v2.5a2.25 2.25 0 0 1-4.5 0Z" paint={p} />
      <Rim d="M28.5 35.2q3.5 2.4 7 0" paint={p} />
    </>
  );
}

function Toolbox({ p }: { p: Paint }) {
  return (
    <>
      <Ground cx={32} rx={23} paint={p} />
      <Rim d="M44.5 21 51 9.5" paint={p} width={3} />
      <Body d="M49.6 4.4a5 5 0 1 0 6.3 6.8l-3-.7-1-2.9Z" paint={p} />
      <Rim d="M17.5 21 14.5 11" paint={p} width={2.2} />
      <Body d="M11 3.6 16.2 2l2.2 7.4-5.2 1.6Z" paint={p} />
      <Rim d="M24 18v-4.5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3V18" paint={p} />
      <Body d="M11 18h42a5 5 0 0 1 5 5v20a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V23a5 5 0 0 1 5-5Z" paint={p} />
      <Shine d="M10 21.6c4-1 12-1.3 20-1 .8 0 .8 1.2 0 1.2-7 .1-13.5.6-19.4 1.2-1 .1-1.4-1.1-.6-1.4Z" />
      <Body d="M6 27h52v4H6Z" paint={p} deep />
      <Body d="M29.5 24h5a1.8 1.8 0 0 1 1.8 1.8v5.4a1.8 1.8 0 0 1-1.8 1.8h-5a1.8 1.8 0 0 1-1.8-1.8v-5.4a1.8 1.8 0 0 1 1.8-1.8Z" paint={p} />
    </>
  );
}

function Mug({ p }: { p: Paint }) {
  return (
    <>
      <Ground cx={28} rx={19} paint={p} />
      <Rim d="M21.5 13c-2-2 2-4 0-7M29.5 13c-2-2 2-4 0-7" paint={p} />
      <Rim d="M44 24h3.5a8 8 0 0 1 0 16H44" paint={p} width={3.2} />
      <Body d="M10 17h34v21a11 11 0 0 1-11 11H21a11 11 0 0 1-11-11Z" paint={p} />
      <Body d="M10 17h34v5.5H10Z" paint={p} deep />
      <Shine d="M14.2 26.5c.8 0 1.4.6 1.4 1.4v10.4c0 .8-.6 1.4-1.4 1.4s-1.4-.6-1.4-1.4V27.9c0-.8.6-1.4 1.4-1.4Z" />
      <Body d="M53 4a8 8 0 1 0 8 12 6.5 6.5 0 0 1-8-12Z" paint={p} />
    </>
  );
}

const BIG_GEAR = gear(24, 31, 17, 10, 3.6);
const SMALL_GEAR = gear(48.5, 14.5, 10.5, 8, 2.8);

function Gears({ p }: { p: Paint }) {
  return (
    <>
      <Ground cx={30} rx={21} paint={p} />
      <Body d={SMALL_GEAR} paint={p} />
      <Body d="M51.7 14.5a3.2 3.2 0 1 1-6.4 0 3.2 3.2 0 0 1 6.4 0Z" paint={p} deep />
      <Body d={BIG_GEAR} paint={p} />
      <Shine d="M14 22.6c2.6-2.6 6.4-3.8 10-3.6.8 0 .8 1.2 0 1.3-3.2.3-6 1.4-8.4 3.3-.8.6-2.1-.2-1.6-1Z" />
      <Body d="M29.5 31a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Z" paint={p} deep />
      <Solid d="M25.8 31a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0Z" paint={p} />
    </>
  );
}

function Pen({ p }: { p: Paint }) {
  return (
    <>
      <Ground cx={30} rx={24} paint={p} />
      <Rim d="M5 46c3-6 6 3 9-.5s5-6 9-1 5 2 7-1" paint={p} width={3.2} />
      <Body d="M30 44l2-8 19-19 6 6-19 19Z" paint={p} />
      <Shine d="M34.6 37.4 49.4 22.6c.5-.5 1.3.3.8.8L35.4 38.2c-.5.5-1.3-.3-.8-.8Z" />
      <Rim d="M32 36l6 6" paint={p} />
      <Rim d="M47.5 20.5l6 6" paint={p} />
      <Body d="M51 17l3-3 6 6-3 3Z" paint={p} deep />
      <Solid d="M30 44l1-3.6 2.6 2.6Z" paint={p} />
    </>
  );
}

function Plane({ p }: { p: Paint }) {
  return (
    <>
      <Rim d="M4 44c6-2 8-8 4-10s-5 5 0 6 11-1 16-5" paint={p} dashed />
      <Body d="M22 27 60 8 46 45 34 35Z" paint={p} />
      <Body d="M60 8 34 35l-2.5 12 8.5-8.5Z" paint={p} deep />
      <Shine d="M29.4 26.6 51.2 15c.6-.3 1.2.6.6 1L30 27.8c-.7.4-1.3-.8-.6-1.2Z" />
      <Rim d="M60 8 34 35" paint={p} />
    </>
  );
}

const ART: Record<InlineArtName, (props: { p: Paint }) => ReactNode> = {
  bot: Bot,
  toolbox: Toolbox,
  mug: Mug,
  gears: Gears,
  pen: Pen,
  plane: Plane,
};

export function InlineArt({ name, className }: { name: InlineArtName; className?: string }) {
  const Draw = ART[name];
  const paint: Paint = { tint: `ia-${name}-tint`, deep: `ia-${name}-deep`, rim: `ia-${name}-rim` };
  return (
    <svg
      viewBox="0 0 64 56"
      aria-hidden="true"
      focusable="false"
      className={cn("mx-[0.15em] inline-block h-[2.2em] w-auto overflow-visible align-[-0.7em]", className)}
    >
      <defs>
        <linearGradient id={paint.tint} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--glass-tint-from)" />
          <stop offset="1" stopColor="var(--glass-tint-to)" />
        </linearGradient>
        <linearGradient id={paint.deep} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--glass-tint-to)" />
          <stop offset="1" stopColor="var(--glass-rim-to)" />
        </linearGradient>
        <linearGradient id={paint.rim} x1="0" y1="0" x2="64" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--glass-rim-from)" />
          <stop offset="1" stopColor="var(--glass-rim-to)" />
        </linearGradient>
      </defs>
      <Draw p={paint} />
    </svg>
  );
}
