import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  isoPlay,
  isoRipple,
  isoTwinkle,
  isoType,
} from "@/components/diagrams/classes";

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

function project(p: Projector, [x, y, z]: Vec3): Vec2 {
  return [p.ox + (x - y) * COS * p.scale, p.oy + ((x + y) / 2 - z) * p.scale];
}

function toPoints(p: Projector, list: Vec3[]) {
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

function face(tone: Tone, side: "top" | "left" | "right") {
  return cn("stroke-1 [stroke-linejoin:round]", TONES[tone].stroke, TONES[tone][side]);
}

const LINE = "fill-none [stroke-linecap:round] [stroke-linejoin:round]";
const GUIDE = cn(LINE, "stroke-foreground/20 stroke-1 [stroke-dasharray:2_4]");
const DOT = "fill-foreground/28";

const TEXT_TONES = {
  default: "fill-foreground/75",
  muted: "fill-muted-foreground",
  accent: "fill-(--brand-text)",
} as const;

const LABEL_TONES = {
  default: "fill-foreground",
  muted: "fill-muted-foreground",
  accent: "fill-(--brand-text)",
} as const;

const ACTIVE_LIFT =
  "transition-transform duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] delay-(--delay) in-data-iso-active:translate-y-(--lift) group-hover/iso:translate-y-(--lift) group-focus-visible/iso:translate-y-(--lift) in-data-iso-ambient:in-data-iso-active:animate-iso-float in-data-iso-ambient:group-hover/iso:animate-iso-float in-data-iso-ambient:group-focus-visible/iso:animate-iso-float";

const SHADOW =
  "fill-foreground/9 [transform-box:fill-box] origin-center transition-[scale] duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] in-data-iso-active:scale-75 group-hover/iso:scale-75 group-focus-visible/iso:scale-75 in-data-iso-ambient:in-data-iso-active:animate-iso-shadow in-data-iso-ambient:group-hover/iso:animate-iso-shadow in-data-iso-ambient:group-focus-visible/iso:animate-iso-shadow";

const PRINT =
  "in-data-iso-active:animate-iso-print group-hover/iso:animate-iso-print group-focus-visible/iso:animate-iso-print";

const PRINT_TONES = {
  default: "fill-foreground/35",
  accent: "fill-(--brand)",
  ghost: "fill-foreground/16",
} as const;

function ellipseRadii(p: Projector, radius: number): Vec2 {
  return [Math.SQRT2 * COS * radius * p.scale, (radius / Math.SQRT2) * p.scale];
}

interface IsoBoxProps {
  p: Projector;
  at: Vec3;
  size: Vec3;
  tone?: Tone;
}

export function IsoBox({ p, at: [x, y, z], size: [w, d, h], tone = "default" }: IsoBoxProps) {
  const t = z + h;
  return (
    <g>
      <polygon
        className={face(tone, "left")}
        points={toPoints(p, [
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, t],
          [x, y + d, t],
        ])}
      />
      <polygon
        className={face(tone, "right")}
        points={toPoints(p, [
          [x + w, y, z],
          [x + w, y + d, z],
          [x + w, y + d, t],
          [x + w, y, t],
        ])}
      />
      <polygon
        className={face(tone, "top")}
        points={toPoints(p, [
          [x, y, t],
          [x + w, y, t],
          [x + w, y + d, t],
          [x, y + d, t],
        ])}
      />
    </g>
  );
}

interface IsoCylinderProps {
  p: Projector;
  center: Vec3;
  radius: number;
  height: number;
  tone?: Tone;
}

export function IsoCylinder({
  p,
  center: [cx, cy, cz],
  radius,
  height,
  tone = "default",
}: IsoCylinderProps) {
  const [rx, ry] = ellipseRadii(p, radius);
  const [bx, by] = project(p, [cx, cy, cz]);
  const [tx, ty] = project(p, [cx, cy, cz + height]);
  const side = `M${bx - rx},${ty} L${bx - rx},${by} A${rx},${ry} 0 0 0 ${bx + rx},${by} L${bx + rx},${ty} Z`;
  return (
    <g>
      <path className={face(tone, "right")} d={side} />
      <ellipse className={face(tone, "top")} cx={tx} cy={ty} rx={rx} ry={ry} />
    </g>
  );
}

interface IsoConeProps {
  p: Projector;
  tip: Vec3;
  radius: number;
  height: number;
}

export function IsoCone({ p, tip: [x, y, z], radius, height }: IsoConeProps) {
  const [rx, ry] = ellipseRadii(p, radius);
  const [tx, ty] = project(p, [x, y, z]);
  const [cx, cy] = project(p, [x, y, z + height]);
  const [sx, sy] = project(p, [x, y, z + height + radius * 0.75]);
  const r = rx * 0.95;
  const side = `M${tx},${ty} L${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy} Z`;
  const waffle = `M${tx},${ty} L${cx - rx * 0.4},${cy + ry * 0.92} M${tx},${ty} L${cx + rx * 0.4},${cy + ry * 0.92}`;
  const chips: Vec2[] = [
    [-0.35, -0.3],
    [0.3, -0.45],
    [0.4, 0.15],
    [-0.15, 0.3],
  ];
  return (
    <g>
      <path className={face("default", "left")} d={side} />
      <path className={GUIDE} d={waffle} />
      <g>
        <circle className={face("accent", "top")} cx={sx} cy={sy} r={r} />
        <path
          className={face("accent", "top")}
          d={`M${sx + r * 0.35},${sy + r * 0.9} q${r * 0.12},${r * 0.55} 0,${r * 0.7} q${-r * 0.12},${-r * 0.15} 0,${-r * 0.7}`}
        />
      </g>
      {chips.map(([dx, dy]) => (
        <circle key={`${dx}${dy}`} className={DOT} cx={sx + dx * r} cy={sy + dy * r} r={1} />
      ))}
    </g>
  );
}

interface IsoRippleProps {
  p: Projector;
  center: Vec3;
  radius: number;
}

export function IsoRipple({ p, center, radius }: IsoRippleProps) {
  const [rx, ry] = ellipseRadii(p, radius);
  const [cx, cy] = project(p, center);
  return (
    <g>
      {[0, 1].map((i) => (
        <ellipse
          key={i}
          className={isoRipple}
          style={{ animationDelay: `${i * 0.9}s` }}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
        />
      ))}
    </g>
  );
}

interface IsoShadowProps {
  p: Projector;
  center: Vec3;
  radius: number;
}

export function IsoShadow({ p, center, radius }: IsoShadowProps) {
  const [rx, ry] = ellipseRadii(p, radius);
  const [cx, cy] = project(p, center);
  return <ellipse className={SHADOW} cx={cx} cy={cy} rx={rx} ry={ry} />;
}

interface IsoPrintProps {
  p: Projector;
  center: Vec3;
  toward: Vec3;
  radius: number;
  index: number;
  tone?: "default" | "accent" | "ghost";
}

export function IsoPrint({ p, center, toward, radius, index, tone = "default" }: IsoPrintProps) {
  const [cx, cy] = project(p, center);
  const [tx, ty] = project(p, toward);
  const angle = (Math.atan2(ty - cy, tx - cx) * 180) / Math.PI;
  const size = radius * p.scale;
  return (
    <ellipse
      className={cn(PRINT_TONES[tone], PRINT)}
      style={{ animationDelay: `${index * 180}ms` }}
      rx={(size * 1.5).toFixed(2)}
      ry={(size * 0.75).toFixed(2)}
      transform={`translate(${cx.toFixed(2)} ${cy.toFixed(2)}) rotate(${angle.toFixed(2)})`}
    />
  );
}

interface IsoFlowProps {
  p: Projector;
  points: Vec3[];
  tone?: Tone;
}

export function IsoFlow({ p, points, tone = "default" }: IsoFlowProps) {
  const [ex, ey] = project(p, points[points.length - 1]);
  const [px, py] = project(p, points[points.length - 2]);
  const angle = (Math.atan2(ey - py, ex - px) * 180) / Math.PI;
  return (
    <g>
      <polyline
        className={cn(
          LINE,
          TONES[tone].stroke,
          "[stroke-width:1.25] [stroke-dasharray:1_5] animate-iso-march",
          isoPlay,
        )}
        points={toPoints(p, points)}
      />
      <path
        className={cn(LINE, TONES[tone].stroke, "[stroke-width:1.25]")}
        d="M-6,-3.5 L0,0 L-6,3.5"
        transform={`translate(${ex.toFixed(2)} ${ey.toFixed(2)}) rotate(${angle.toFixed(2)})`}
      />
    </g>
  );
}

interface IsoPlateProps {
  p: Projector;
  at: Vec3;
  size: readonly [number, number];
}

export function IsoPlate({ p, at: [x, y, z], size: [w, d] }: IsoPlateProps) {
  return (
    <polygon
      className="fill-foreground/2 stroke-foreground/25 [stroke-dasharray:3_3]"
      points={toPoints(p, [
        [x, y, z],
        [x + w, y, z],
        [x + w, y + d, z],
        [x, y + d, z],
      ])}
    />
  );
}

interface IsoDotsProps {
  p: Projector;
  at: Vec3;
  size: readonly [number, number];
  step?: number;
  shape?: "rect" | "circle" | "rows";
  lit?: number;
  seed?: number;
}

export function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

export function IsoDots({
  p,
  at: [x, y, z],
  size: [w, d],
  step = 0.5,
  shape = "rect",
  lit = 0.12,
  seed = 1,
}: IsoDotsProps) {
  const dots: { cx: number; cy: number; on: boolean; delay: number }[] = [];
  const cols = Math.floor(w / step);
  const rows = Math.floor(d / step);
  const r = Math.min(w, d) / 2;
  let i = 0;
  for (let ix = 0; ix <= cols; ix++) {
    for (let iy = 0; iy <= rows; iy++) {
      const lx = ix * step;
      const ly = iy * step;
      if (shape === "circle" && Math.hypot(lx - w / 2, ly - d / 2) > r) continue;
      if (shape === "rows" && (iy % 3 === 2 || ix > cols * (0.45 + 0.55 * hash(iy + seed)))) continue;
      const [cx, cy] = project(p, [x + lx, y + ly, z]);
      const h = hash(++i + seed * 97);
      dots.push({ cx, cy, on: h < lit, delay: hash(i + seed) * 3 });
    }
  }
  return (
    <g>
      {dots.map(({ cx, cy, on, delay }) => (
        <circle
          key={`${cx.toFixed(1)}-${cy.toFixed(1)}`}
          className={on ? isoTwinkle : DOT}
          style={on ? { animationDelay: `-${delay.toFixed(2)}s` } : undefined}
          cx={cx.toFixed(2)}
          cy={cy.toFixed(2)}
          r={on ? 1.3 : 0.9}
        />
      ))}
    </g>
  );
}

interface IsoGuideProps {
  p: Projector;
  from: Vec3;
  to: Vec3;
}

export function IsoGuide({ p, from, to }: IsoGuideProps) {
  const [x1, y1] = project(p, from);
  const [x2, y2] = project(p, to);
  return <line className={GUIDE} x1={x1} y1={y1} x2={x2} y2={y2} />;
}

interface IsoLiftProps {
  lift: number;
  delay?: number;
  children: ReactNode;
}

export function IsoLift({ lift, delay = 0, children }: IsoLiftProps) {
  return (
    <g
      className={ACTIVE_LIFT}
      style={
        {
          "--lift": `${lift}px`,
          "--delay": `${delay}ms`,
          animationDelay: `${delay * 4}ms`,
        } as CSSProperties
      }
    >
      {children}
    </g>
  );
}

interface IsoPathProps {
  p: Projector;
  points: Vec3[];
  tone?: Tone;
}

export function IsoPath({ p, points, tone = "default" }: IsoPathProps) {
  return (
    <polyline
      className={cn(LINE, TONES[tone].stroke, "[stroke-width:1.25]")}
      points={toPoints(p, points)}
    />
  );
}

type Plane = "top" | "left" | "right";

const PLANE_MATRIX: Record<Plane, readonly [number, number, number, number]> = {
  top: [COS, 0.5, -COS, 0.5],
  left: [COS, 0.5, 0, 1],
  right: [COS, -0.5, 0, 1],
};

interface IsoFaceTextProps {
  p: Projector;
  plane: Plane;
  at: Vec3;
  size?: number;
  tone?: "default" | "accent" | "muted";
  keepCase?: boolean;
  children: ReactNode;
}

export function IsoFaceText({
  p,
  plane,
  at,
  size = 8,
  tone = "default",
  keepCase = false,
  children,
}: IsoFaceTextProps) {
  const [a, b, c, d] = PLANE_MATRIX[plane];
  const [x, y] = project(p, at);
  return (
    <text
      className={cn(isoType, TEXT_TONES[tone], keepCase && "normal-case")}
      transform={`matrix(${a} ${b} ${c} ${d} ${x.toFixed(2)} ${y.toFixed(2)})`}
      fontSize={size}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {children}
    </text>
  );
}

interface IsoLabelProps {
  p: Projector;
  at: Vec3;
  dx?: number;
  dy?: number;
  size?: number;
  anchor?: "start" | "middle" | "end";
  tone?: "default" | "accent" | "muted";
  leader?: boolean;
  children: ReactNode;
}

export function IsoLabel({
  p,
  at,
  dx = 0,
  dy = 0,
  size = 8,
  anchor = "middle",
  tone = "muted",
  leader = false,
  children,
}: IsoLabelProps) {
  const [x, y] = project(p, at);
  const pad = leader ? (anchor === "end" ? -4 : anchor === "start" ? 4 : 0) : 0;
  return (
    <g>
      {leader && (
        <>
          <line
            className="fill-none stroke-foreground/25 stroke-1"
            x1={x}
            y1={y}
            x2={x + dx}
            y2={y + dy}
          />
          <circle
            className="fill-background stroke-foreground/45"
            cx={x}
            cy={y}
            r={1.6}
          />
        </>
      )}
      <text
        className={cn(isoType, LABEL_TONES[tone])}
        x={x + dx + pad}
        y={y + dy}
        fontSize={size}
        textAnchor={anchor}
        dominantBaseline="central"
      >
        {children}
      </text>
    </g>
  );
}

interface IsoSvgProps {
  viewBox: string;
  children: ReactNode;
}

export function IsoSvg({ viewBox, children }: IsoSvgProps) {
  return (
    <svg
      viewBox={viewBox}
      aria-hidden="true"
      focusable="false"
      className="absolute inset-0 size-full"
    >
      {children}
    </svg>
  );
}
