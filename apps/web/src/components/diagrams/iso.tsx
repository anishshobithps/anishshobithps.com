import { cn } from "@repo/ui/lib/cn";

/**
 * The small projection helpers the OG images, the post-grid filler and the
 * git chart still use. Page figures are drawn by `@/lib/iso` instead.
 */

export type Vec3 = readonly [number, number, number];
type Vec2 = readonly [number, number];

type Tone = "default" | "accent" | "ghost";

interface Projector {
  scale: number;
  ox: number;
  oy: number;
}

const COS = Math.cos(Math.PI / 6);

export function projector(scale: number, ox: number, oy: number): Projector {
  return { scale, ox, oy };
}

export function project(p: Projector, [x, y, z]: Vec3): Vec2 {
  return [p.ox + (x - y) * COS * p.scale, p.oy + ((x + y) / 2 - z) * p.scale];
}

export function toPoints(p: Projector, list: Vec3[]) {
  return list
    .map((v) =>
      project(p, v)
        .map((n) => n.toFixed(2))
        .join(","),
    )
    .join(" ");
}

const TONES: Record<
  Tone,
  { stroke: string; top: string; left: string; right: string }
> = {
  default: {
    stroke: "stroke-foreground/45",
    top: "fill-[color-mix(in_oklab,var(--foreground)_6%,var(--background))]",
    left: "fill-[color-mix(in_oklab,var(--foreground)_3%,var(--background))]",
    right: "fill-background",
  },
  accent: {
    stroke: "stroke-(--brand)",
    top: "fill-[color-mix(in_oklab,var(--brand)_16%,var(--background))]",
    left: "fill-[color-mix(in_oklab,var(--brand)_8%,var(--background))]",
    right: "fill-[color-mix(in_oklab,var(--brand)_4%,var(--background))]",
  },
  ghost: {
    stroke: "stroke-foreground/28 [stroke-dasharray:3_3]",
    top: "fill-transparent",
    left: "fill-transparent",
    right: "fill-transparent",
  },
};

type BoxSide = "top" | "left" | "right";

function face(tone: Tone, side: BoxSide) {
  return cn(
    "stroke-1 [stroke-linejoin:round]",
    TONES[tone].stroke,
    TONES[tone][side],
  );
}

export function ellipseRadii(p: Projector, radius: number): Vec2 {
  return [Math.SQRT2 * COS * radius * p.scale, (radius / Math.SQRT2) * p.scale];
}

export function boxFaces(
  [x, y, z]: Vec3,
  [w, d, h]: Vec3,
): readonly (readonly [BoxSide, Vec3[]])[] {
  const t = z + h;
  return [
    [
      "left",
      [
        [x, y + d, z],
        [x + w, y + d, z],
        [x + w, y + d, t],
        [x, y + d, t],
      ],
    ],
    [
      "right",
      [
        [x + w, y, z],
        [x + w, y + d, z],
        [x + w, y + d, t],
        [x + w, y, t],
      ],
    ],
    [
      "top",
      [
        [x, y, t],
        [x + w, y, t],
        [x + w, y + d, t],
        [x, y + d, t],
      ],
    ],
  ];
}

interface IsoBoxProps {
  p: Projector;
  at: Vec3;
  size: Vec3;
  tone?: Tone;
}

export function IsoBox({ p, at, size, tone = "default" }: IsoBoxProps) {
  return (
    <g>
      {boxFaces(at, size).map(([side, points]) => (
        <polygon
          key={side}
          className={face(tone, side)}
          points={toPoints(p, points)}
        />
      ))}
    </g>
  );
}

export function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}
