import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

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
    <g data-tone={tone}>
      <polygon
        className="iso-face iso-face-left"
        points={toPoints(p, [
          [x, y + d, z],
          [x + w, y + d, z],
          [x + w, y + d, t],
          [x, y + d, t],
        ])}
      />
      <polygon
        className="iso-face iso-face-right"
        points={toPoints(p, [
          [x + w, y, z],
          [x + w, y + d, z],
          [x + w, y + d, t],
          [x + w, y, t],
        ])}
      />
      <polygon
        className="iso-face iso-face-top"
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
    <g data-tone={tone}>
      <path className="iso-face iso-face-right" d={side} />
      <ellipse className="iso-face iso-face-top" cx={tx} cy={ty} rx={rx} ry={ry} />
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
          className="iso-ripple"
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
    <g data-tone={tone}>
      <polyline className="iso-flow" points={toPoints(p, points)} />
      <path
        className="iso-arrow"
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
      className="iso-plate"
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

function hash(n: number) {
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
          className={cn("iso-dot", on && "iso-dot-lit")}
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
  return <line className="iso-guide" x1={x1} y1={y1} x2={x2} y2={y2} />;
}

interface IsoLiftProps {
  lift: number;
  delay?: number;
  children: ReactNode;
}

export function IsoLift({ lift, delay = 0, children }: IsoLiftProps) {
  return (
    <g
      className="iso-lift"
      style={{ "--lift": `${lift}px`, "--delay": `${delay}ms` } as CSSProperties}
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
    <g data-tone={tone}>
      <polyline className="iso-arrow" points={toPoints(p, points)} />
    </g>
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
      className="iso-text"
      data-tone={tone}
      style={keepCase ? { textTransform: "none" } : undefined}
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
          <line className="iso-leader" x1={x} y1={y} x2={x + dx} y2={y + dy} />
          <circle className="iso-node" cx={x} cy={y} r={1.6} />
        </>
      )}
      <text
        className="iso-label"
        data-tone={tone}
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
