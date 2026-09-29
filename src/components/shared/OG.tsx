import {
  boxFaces,
  ellipseRadii,
  hash,
  project,
  projector,
  toPoints,
  type Vec3,
} from "@/components/diagrams/iso";
import { LogoIcon } from "@/components/shared/logo-icon";
import { MASCOT_POINTS, MascotFigure } from "@/components/shared/logo-mascot";
import { themeColor } from "@/lib/theme-tokens";
import type { CSSProperties, ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_FONTS = {
  display: {
    name: "Bricolage Grotesque",
    weight: 700,
    googleFamily: "Bricolage+Grotesque:opsz,wght@60,700",
  },
  body: { name: "Manrope", weight: 500, googleFamily: "Manrope:wght@500" },
  pixel: {
    name: "Geist Pixel",
    weight: 400,
    googleFamily: "Geist+Pixel:ELSH@0..100",
  },
} as const;

export interface OGImageProps {
  title: string;
  description: string;
  name: string;
  role: string;
  domain: string;
  path: string;
  tags: string[];
  availableForHire: boolean;
}

const { width: WIDTH, height: HEIGHT } = OG_SIZE;
const RAIL = 40;
const BAND = 28;
const HEADER = 72;
const FOOTER = 88;
const GUTTER = 56;
const HAIRLINE = 1;
const FILLET = 14;
const HATCH = 8;
const ART_WIDTH = 416;

const FRAME = {
  left: RAIL,
  top: BAND,
  right: WIDTH - RAIL,
  bottom: HEIGHT - BAND,
};

const ART_HEIGHT =
  FRAME.bottom - FRAME.top - 4 * HAIRLINE - HEADER - FOOTER;

const token = (name: string) => themeColor(`var(--${name})`);

const tint = (name: string, amount: number) =>
  themeColor(
    `color-mix(in oklab, var(--${name}) ${amount}%, var(--background))`,
  );

const fade = (name: string, amount: number) =>
  themeColor(`color-mix(in oklab, var(--${name}) ${amount}%, transparent)`);

const color = {
  background: token("background"),
  foreground: token("foreground"),
  muted: token("muted-foreground"),
  line: token("line"),
  hatch: token("hatch-line"),
  brand: token("brand"),
  brandText: token("brand-text"),
  available: token("color-available"),
  surface: tint("foreground", 3),
  floor: tint("foreground", 2),
  extrusion: tint("foreground", 28),
  stroke: fade("foreground", 45),
  guide: fade("foreground", 28),
  speck: fade("foreground", 9),
  shadow: themeColor("oklch(0 0 0 / 35%)"),
  hireBorder: fade("brand-text", 30),
  hireFill: fade("brand", 12),
  hireRing: fade("color-available", 16),
};

const TONES = {
  default: {
    stroke: color.stroke,
    top: tint("foreground", 9),
    left: tint("foreground", 5),
    right: tint("foreground", 2),
  },
  accent: {
    stroke: color.brand,
    top: tint("brand", 24),
    left: tint("brand", 12),
    right: tint("brand", 6),
  },
} as const;

const family = {
  display: `'${OG_FONTS.display.name}', Geist, sans-serif`,
  body: `'${OG_FONTS.body.name}', Geist, sans-serif`,
  pixel: `'${OG_FONTS.pixel.name}', 'Geist Mono', monospace`,
};

const PIXEL_SHAPE = "'ELSH' 25";

const TITLE_SIZES = [
  [20, 68],
  [40, 56],
  [64, 46],
] as const;

function titleSize(title: string) {
  return (
    TITLE_SIZES.find(([maxLength]) => title.length <= maxLength)?.[1] ?? 40
  );
}

const ART_P = projector(20, ART_WIDTH / 2, 230);

const MASCOT = {
  base: [0, 0.5, 0.8] as Vec3,
  anchor: [32, 60] as const,
  scale: 0.11,
  depth: 0.9,
  layers: 20,
};

const MASCOT_LAYERS = Array.from(
  { length: MASCOT.layers },
  (_, i) => MASCOT.depth * (1 - i / MASCOT.layers),
);

const FLOOR = { radius: 5, dotRadius: 4.6, step: 0.9 };
const FLOOR_STEP_COUNT = Math.floor(FLOOR.dotRadius / FLOOR.step);
const FLOOR_STEPS = Array.from(
  { length: 2 * FLOOR_STEP_COUNT + 1 },
  (_, i) => (i - FLOOR_STEP_COUNT) * FLOOR.step,
);
const FLOOR_DOTS = FLOOR_STEPS.flatMap((x) =>
  FLOOR_STEPS.map((y): Vec3 => [x, y, 0]),
).filter(([x, y]) => Math.hypot(x, y) <= FLOOR.dotRadius);

const SPARKLES: { at: Vec3; radius: number }[] = [
  { at: [-1.4, 1, 7.4], radius: 7 },
  { at: [4.6, -4.6, 4.6], radius: 4.5 },
  { at: [-5.2, -0.8, 3.6], radius: 3.5 },
];

function glyphToWorld(u: number, v: number): Vec3 {
  const [x, y, z] = MASCOT.base;
  const [anchorU, anchorV] = MASCOT.anchor;
  return [
    x + (u - anchorU) * MASCOT.scale,
    y,
    z + (anchorV - v) * MASCOT.scale,
  ];
}

function screenDelta(vector: Vec3) {
  const [x0, y0] = project(ART_P, [0, 0, 0]);
  const [x1, y1] = project(ART_P, vector);
  return [x1 - x0, y1 - y0] as const;
}

function glyphMatrix() {
  const [ox, oy] = project(ART_P, glyphToWorld(0, 0));
  const [ux, uy] = project(ART_P, glyphToWorld(1, 0));
  const [vx, vy] = project(ART_P, glyphToWorld(0, 1));
  return `matrix(${ux - ox} ${uy - oy} ${vx - ox} ${vy - oy} ${ox} ${oy})`;
}

const LABEL_POINT = project(ART_P, glyphToWorld(36, 22));
const LABEL_ELBOW = [LABEL_POINT[0] + 48, LABEL_POINT[1] - 44] as const;

function PixelText({
  children,
  size = 14,
  color: textColor = color.muted,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: family.pixel,
        fontVariationSettings: PIXEL_SHAPE,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        textWrap: "nowrap",
        color: textColor,
      }}
    >
      {children}
    </span>
  );
}

function Backdrop() {
  const { left, right, top, bottom } = FRAME;
  const rails = [
    [left + 0.5, 0, left + 0.5, HEIGHT],
    [right - 0.5, 0, right - 0.5, HEIGHT],
    [0, top + 0.5, WIDTH, top + 0.5],
    [0, bottom - 0.5, WIDTH, bottom - 0.5],
  ];

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <defs>
        <pattern
          id="og-hatch"
          width={HATCH}
          height={HATCH}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1={HATCH / 2}
            y1="0"
            x2={HATCH / 2}
            y2={HATCH}
            stroke={color.hatch}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill="url(#og-hatch)" />
      <g stroke={color.line} strokeWidth="1">
        {rails.map(([x1, y1, x2, y2]) => (
          <line
            key={`${x1}-${y1}-${x2}-${y2}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        ))}
      </g>
    </svg>
  );
}

function Cell({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        overflow: "hidden",
        borderRadius: FILLET,
        backgroundColor: color.background,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Breadcrumb({ path }: { path: string }) {
  const segments = path
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {segments.map((segment, index) => (
        <div
          key={`${index}-${segment}`}
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          {index > 0 && <PixelText color={color.guide}>/</PixelText>}
          <PixelText
            color={
              index === segments.length - 1 ? color.brandText : color.muted
            }
          >
            {segment}
          </PixelText>
        </div>
      ))}
    </div>
  );
}

function Header({ path, domain }: Pick<OGImageProps, "path" | "domain">) {
  return (
    <Cell
      style={{
        flexShrink: 0,
        height: HEADER,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
        paddingLeft: GUTTER,
        paddingRight: GUTTER,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <LogoIcon size={26} color={color.foreground} />
        <div style={{ width: 1, height: 18, backgroundColor: color.line }} />
        <Breadcrumb path={path} />
      </div>
      <PixelText>{domain}</PixelText>
    </Cell>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        height: 28,
        overflow: "hidden",
      }}
    >
      {tags.map((tag, index) => (
        <div
          key={`${index}-${tag}`}
          style={{
            display: "flex",
            alignItems: "center",
            height: 28,
            paddingLeft: 10,
            paddingRight: 10,
            borderRadius: 6,
            border: `1px solid ${color.line}`,
            backgroundColor: color.surface,
          }}
        >
          <PixelText size={13}>{`#${tag}`}</PixelText>
        </div>
      ))}
    </div>
  );
}

function Copy({
  title,
  description,
  tags,
}: Pick<OGImageProps, "title" | "description" | "tags">) {
  return (
    <Cell
      style={{
        flex: 1,
        minWidth: 0,
        flexDirection: "column",
        justifyContent: "center",
        gap: 28,
        paddingLeft: GUTTER,
        paddingRight: 48,
      }}
    >
      {tags.length > 0 && <Tags tags={tags} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontFamily: family.display,
            fontWeight: OG_FONTS.display.weight,
            fontSize: titleSize(title),
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            color: color.foreground,
            textWrap: "balance",
            lineClamp: 3,
            overflow: "hidden",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontFamily: family.body,
              fontWeight: OG_FONTS.body.weight,
              fontSize: 20,
              lineHeight: 1.5,
              color: color.muted,
              textWrap: "pretty",
              lineClamp: 3,
              overflow: "hidden",
            }}
          >
            {description}
          </div>
        )}
      </div>
    </Cell>
  );
}

function Box({
  at,
  size,
  tone,
}: {
  at: Vec3;
  size: Vec3;
  tone: keyof typeof TONES;
}) {
  const colors = TONES[tone];
  return (
    <g stroke={colors.stroke} strokeWidth="1.25" strokeLinejoin="round">
      {boxFaces(at, size).map(([side, points]) => (
        <polygon
          key={side}
          fill={colors[side]}
          points={toPoints(ART_P, points)}
        />
      ))}
    </g>
  );
}

function Shadow({
  center,
  radius,
  fill,
}: {
  center: Vec3;
  radius: number;
  fill: string;
}) {
  const [cx, cy] = project(ART_P, center);
  const [rx, ry] = ellipseRadii(ART_P, radius);
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />;
}

function FloatingCube({
  at,
  size,
  tone,
}: {
  at: Vec3;
  size: number;
  tone: keyof typeof TONES;
}) {
  const [x, y, z] = at;
  const center: Vec3 = [x + size / 2, y + size / 2, 0];
  const [x1, y1] = project(ART_P, center);
  const [x2, y2] = project(ART_P, [center[0], center[1], z]);

  return (
    <g>
      <Shadow center={center} radius={size * 0.7} fill={color.speck} />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color.guide}
        strokeWidth="1"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />
      <Box at={at} size={[size, size, size]} tone={tone} />
    </g>
  );
}

function Floor() {
  const r = FLOOR.radius;
  return (
    <g>
      <polygon
        points={toPoints(ART_P, [
          [-r, -r, 0],
          [r, -r, 0],
          [r, r, 0],
          [-r, r, 0],
        ])}
        fill={color.floor}
        stroke={color.guide}
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      {FLOOR_DOTS.map((point, index) => {
        const [cx, cy] = project(ART_P, point);
        const lit = hash(index + 1) < 0.12;
        return (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={lit ? 1.5 : 1}
            fill={lit ? color.brandText : color.guide}
          />
        );
      })}
    </g>
  );
}

function Mascot() {
  const matrix = glyphMatrix();
  return (
    <g>
      {MASCOT_LAYERS.map((depth) => {
        const [dx, dy] = screenDelta([0, -depth, 0]);
        return (
          <polygon
            key={depth}
            points={MASCOT_POINTS}
            fill={color.extrusion}
            transform={`translate(${dx} ${dy}) ${matrix}`}
          />
        );
      })}
      <g color={color.foreground} transform={matrix}>
        <MascotFigure />
      </g>
    </g>
  );
}

function Sparkle({ at, radius: r }: { at: Vec3; radius: number }) {
  const [x, y] = project(ART_P, at);
  return (
    <path
      d={`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`}
      fill={color.brandText}
    />
  );
}

function Leader() {
  const [x, y] = LABEL_POINT;
  const [ex, ey] = LABEL_ELBOW;
  return (
    <g>
      <polyline
        points={`${x},${y} ${ex},${ey} ${ex + 8},${ey}`}
        fill="none"
        stroke={color.guide}
        strokeWidth="1"
      />
      <circle
        cx={x}
        cy={y}
        r="2"
        fill={color.background}
        stroke={color.stroke}
        strokeWidth="1"
      />
    </g>
  );
}

function Art() {
  const [glowX, glowY] = project(ART_P, [0, 0.05, 3.8]);
  const [elbowX, elbowY] = LABEL_ELBOW;

  return (
    <Cell style={{ flexShrink: 0, width: ART_WIDTH }}>
      <svg
        width={ART_WIDTH}
        height={ART_HEIGHT}
        viewBox={`0 0 ${ART_WIDTH} ${ART_HEIGHT}`}
      >
        <defs>
          <pattern
            id="og-dots"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="8" cy="8" r="1" fill={color.speck} />
          </pattern>
          <radialGradient id="og-fade" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="og-vignette">
            <rect width={ART_WIDTH} height={ART_HEIGHT} fill="url(#og-fade)" />
          </mask>
          <radialGradient id="og-glow">
            <stop offset="0" stopColor={color.brand} stopOpacity="0.28" />
            <stop offset="1" stopColor={color.brand} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect
          width={ART_WIDTH}
          height={ART_HEIGHT}
          fill="url(#og-dots)"
          mask="url(#og-vignette)"
        />
        <circle cx={glowX} cy={glowY} r="190" fill="url(#og-glow)" />
        <Floor />
        <FloatingCube at={[-4.6, -0.2, 1.8]} size={1.2} tone="default" />
        <Box at={[-2.2, -2.2, 0]} size={[4.4, 4.4, 0.8]} tone="accent" />
        <Shadow center={[0, 0.05, 0.8]} radius={1.9} fill={color.shadow} />
        <Mascot />
        <FloatingCube at={[2.9, -4.1, 2.4]} size={1.1} tone="accent" />
        {SPARKLES.map(({ at, radius }) => (
          <Sparkle key={at.join()} at={at} radius={radius} />
        ))}
        <Leader />
      </svg>
      <div
        style={{
          position: "absolute",
          left: elbowX + 12,
          top: elbowY - 7,
          display: "flex",
        }}
      >
        <PixelText color={color.brandText}>that’s me</PixelText>
      </div>
    </Cell>
  );
}

function HireBadge() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 34,
        paddingLeft: 13,
        paddingRight: 14,
        borderRadius: 17,
        border: `1px solid ${color.hireBorder}`,
        backgroundColor: color.hireFill,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: color.available,
          boxShadow: `0 0 0 4px ${color.hireRing}`,
        }}
      />
      <PixelText color={color.brandText}>Available for hire</PixelText>
    </div>
  );
}

function Footer({
  name,
  role,
  showName,
  availableForHire,
}: Pick<OGImageProps, "name" | "role" | "availableForHire"> & {
  showName: boolean;
}) {
  return (
    <Cell
      style={{
        flexShrink: 0,
        height: FOOTER,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: GUTTER,
        paddingRight: GUTTER,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {showName && (
          <span
            style={{
              fontFamily: family.display,
              fontWeight: OG_FONTS.display.weight,
              fontSize: 22,
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: color.foreground,
            }}
          >
            {name}
          </span>
        )}
        <PixelText>{role}</PixelText>
      </div>
      {availableForHire && <HireBadge />}
    </Cell>
  );
}

export function OGImage({
  title,
  description,
  name,
  role,
  domain,
  path,
  tags,
  availableForHire,
}: OGImageProps) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: WIDTH,
        height: HEIGHT,
        overflow: "hidden",
        backgroundColor: color.background,
        fontFamily: family.body,
      }}
    >
      <Backdrop />
      <div
        style={{
          position: "absolute",
          top: FRAME.top,
          left: FRAME.left,
          width: FRAME.right - FRAME.left,
          height: FRAME.bottom - FRAME.top,
          display: "flex",
          flexDirection: "column",
          gap: HAIRLINE,
          padding: HAIRLINE,
          backgroundColor: color.line,
        }}
      >
        <Header path={path} domain={domain} />
        <div style={{ display: "flex", flex: 1, minHeight: 0, gap: HAIRLINE }}>
          <Copy title={title} description={description} tags={tags} />
          <Art />
        </div>
        <Footer
          name={name}
          role={role}
          showName={title !== name}
          availableForHire={availableForHire}
        />
      </div>
    </div>
  );
}
