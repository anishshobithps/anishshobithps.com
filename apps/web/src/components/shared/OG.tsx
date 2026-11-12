import { LogoIcon } from "@/components/shared/logo-icon";
import { MASCOT_POINTS } from "@/components/shared/logo-mascot";
import { FONT_STACK, FONTS, PIXEL_SHAPE } from "@repo/svg-kit/fonts";
import { themeColor } from "@repo/styles/theme-tokens";
import type { CSSProperties, ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 } as const;

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

const MARK = { scale: 5.4, x: 35, y: 18.4 };
const OFFSET = [9, 6] as const;
const MARK_TRANSFORM = `translate(${MARK.x} ${MARK.y}) scale(${MARK.scale})`;
const LABEL_POINT = [MARK.x + 40.5 * MARK.scale, MARK.y + 38 * MARK.scale] as const;
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
        fontFamily: FONT_STACK.pixel,
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
            fontFamily: FONT_STACK.display,
            fontWeight: FONTS.display.weight,
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
              fontFamily: FONT_STACK.body,
              fontWeight: FONTS.body.weight,
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

function MarkShapes({ fill }: { fill: string }) {
  return (
    <g fill={fill}>
      <polygon points={MASCOT_POINTS} />
      <rect x="18" y="36" width="11" height="5" rx="2.5" />
      <rect x="35" y="36" width="11" height="5" rx="2.5" />
    </g>
  );
}

function RegistrationMark({ cx, cy }: { cx: number; cy: number }) {
  const shape = `M${cx - 9} ${cy}H${cx + 9}M${cx} ${cy - 9}V${cy + 9}`;
  return (
    <g fill="none" strokeWidth="1.5">
      <g transform={`translate(${OFFSET[0] / 3} ${OFFSET[1] / 3})`}>
        <path d={shape} stroke={color.brand} />
      </g>
      <circle cx={cx} cy={cy} r="5" stroke={color.foreground} />
      <path d={shape} stroke={color.foreground} />
    </g>
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
          <pattern
            id="og-screen"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2.5" cy="2.5" r="1.4" fill={color.foreground} />
          </pattern>
          <radialGradient id="og-fade" cx="50%" cy="45%" r="60%">
            <stop offset="0" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="og-vignette">
            <rect width={ART_WIDTH} height={ART_HEIGHT} fill="url(#og-fade)" />
          </mask>
        </defs>
        <rect
          width={ART_WIDTH}
          height={ART_HEIGHT}
          fill="url(#og-dots)"
          mask="url(#og-vignette)"
        />
        <ellipse
          cx={ART_WIDTH / 2}
          cy={352}
          rx={130}
          ry={16}
          fill="url(#og-screen)"
        />
        <g transform={`translate(${OFFSET[0]} ${OFFSET[1]}) ${MARK_TRANSFORM}`}>
          <MarkShapes fill={color.brand} />
        </g>
        <g transform={MARK_TRANSFORM}>
          <MarkShapes fill={color.foreground} />
        </g>
        <RegistrationMark cx={30} cy={30} />
        <RegistrationMark cx={ART_WIDTH - 30} cy={ART_HEIGHT - 30} />
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
              fontFamily: FONT_STACK.display,
              fontWeight: FONTS.display.weight,
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
        fontFamily: FONT_STACK.body,
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
