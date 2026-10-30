import { type CSSProperties, Fragment, type ReactNode } from "react";
import { siteConfig } from "@repo/site-config";
import { FONT_STACK, FONTS, PIXEL_SHAPE } from "@/lib/svg/fonts";
import { palette } from "@/lib/svg/palette";
import type { Theme } from "@/lib/svg/template";

type Themed = { theme: Theme };

export const HAIRLINE = 1;
const RADIUS = 12;
export const GUTTER = 24;
export const HEADER_HEIGHT = 44;
export const STATS_HEIGHT = 76;
const ROW_HEIGHT = 52;
const LIST_PADDING = 6;

export function truncate(text: string, max: number) {
  const chars = Array.from(text.trim());
  return chars.length > max
    ? `${chars.slice(0, max - 1).join("").trimEnd()}…`
    : chars.join("");
}

export function plural(count: number, word: string, many = `${word}s`) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? word : many}`;
}

export function Frame({
  theme,
  width,
  height,
  children,
}: Themed & { width: number; height: number; children: ReactNode }) {
  const c = palette(theme);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width,
        height,
        padding: HAIRLINE,
        gap: HAIRLINE,
        borderRadius: RADIUS,
        overflow: "hidden",
        backgroundColor: c.line,
        color: c.foreground,
        fontFamily: FONT_STACK.body,
      }}
    >
      {children}
    </div>
  );
}

export function Cell({
  theme,
  style,
  children,
}: Themed & { style?: CSSProperties; children?: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        overflow: "hidden",
        borderRadius: RADIUS - HAIRLINE,
        backgroundColor: palette(theme).background,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Label({
  theme,
  tone = "muted",
  pixel = false,
  size = pixel ? 12 : 11,
  children,
}: Themed & {
  tone?: "muted" | "accent" | "faint" | "strong";
  pixel?: boolean;
  size?: number;
  children: ReactNode;
}) {
  const c = palette(theme);
  const color = {
    muted: c.muted,
    accent: c.brandText,
    faint: c.guide,
    strong: c.foreground,
  }[tone];
  return (
    <span
      style={{
        fontSize: size,
        lineHeight: 1,
        textTransform: "uppercase",
        textWrap: "nowrap",
        color,
        ...(pixel
          ? {
              fontFamily: FONT_STACK.pixel,
              fontVariationSettings: PIXEL_SHAPE,
              letterSpacing: "0.06em",
            }
          : {
              fontFamily: FONT_STACK.mono,
              fontWeight: FONTS.mono.weight,
              letterSpacing: "0.1em",
            }),
      }}
    >
      {children}
    </span>
  );
}

export function CardHeader({
  theme,
  label,
  meta = siteConfig.domain,
}: Themed & { label: ReactNode; meta?: ReactNode }) {
  return (
    <Cell
      theme={theme}
      style={{
        flexShrink: 0,
        height: HEADER_HEIGHT,
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        paddingLeft: GUTTER,
        paddingRight: GUTTER,
      }}
    >
      <Label theme={theme} tone="accent" pixel>
        {label}
      </Label>
      <Label theme={theme}>{meta}</Label>
    </Cell>
  );
}

export function Title({
  theme,
  size = 28,
  lines = 2,
  children,
}: Themed & { size?: number; lines?: number; children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_STACK.display,
        fontWeight: FONTS.display.weight,
        fontSize: size,
        lineHeight: 1.15,
        letterSpacing: "-0.02em",
        color: palette(theme).foreground,
        textWrap: "balance",
        lineClamp: lines,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export function Body({
  theme,
  size = 15,
  lines = 2,
  children,
}: Themed & { size?: number; lines?: number; children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_STACK.body,
        fontWeight: FONTS.body.weight,
        fontSize: size,
        lineHeight: 1.5,
        color: palette(theme).muted,
        textWrap: "pretty",
        lineClamp: lines,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export function Figure({
  theme,
  size = 22,
  tone = "strong",
  children,
}: Themed & {
  size?: number;
  tone?: "strong" | "muted" | "accent";
  children: ReactNode;
}) {
  const c = palette(theme);
  return (
    <span
      style={{
        fontFamily: FONT_STACK.display,
        fontWeight: FONTS.display.weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        fontVariantNumeric: "tabular-nums",
        textWrap: "nowrap",
        color: { strong: c.foreground, muted: c.muted, accent: c.brandText }[
          tone
        ],
      }}
    >
      {children}
    </span>
  );
}

function Stat({
  theme,
  value,
  label,
  accent = false,
}: Themed & { value: ReactNode; label: ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Figure theme={theme} tone={accent ? "accent" : "strong"}>
        {value}
      </Figure>
      <Label theme={theme}>{label}</Label>
    </div>
  );
}

export function Stats({
  theme,
  items,
}: Themed & {
  items: { label: string; value: ReactNode; accent?: boolean }[];
}) {
  return (
    <div
      style={{
        display: "flex",
        flexShrink: 0,
        height: STATS_HEIGHT,
        gap: HAIRLINE,
      }}
    >
      {items.map(({ label, value, accent }) => (
        <Cell
          key={label}
          theme={theme}
          style={{
            flex: 1,
            alignItems: "center",
            paddingLeft: GUTTER,
            paddingRight: GUTTER,
          }}
        >
          <Stat theme={theme} value={value} label={label} accent={accent} />
        </Cell>
      ))}
    </div>
  );
}

export function listHeight(rows: number, rowHeight = ROW_HEIGHT) {
  return 2 * LIST_PADDING + rows * rowHeight + (rows - 1) * HAIRLINE;
}

export function List({
  theme,
  empty,
  children,
}: Themed & { empty: string; children: ReactNode[] }) {
  return (
    <Cell
      theme={theme}
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: children.length ? "flex-start" : "center",
        paddingTop: LIST_PADDING,
        paddingBottom: LIST_PADDING,
      }}
    >
      {children.length === 0 && (
        <div style={{ display: "flex", paddingLeft: GUTTER, paddingRight: GUTTER }}>
          <Body theme={theme} lines={1}>
            {empty}
          </Body>
        </div>
      )}
      {children.map((child, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <div
              style={{
                height: HAIRLINE,
                marginLeft: GUTTER,
                marginRight: GUTTER,
                backgroundColor: palette(theme).hairline,
              }}
            />
          )}
          {child}
        </Fragment>
      ))}
    </Cell>
  );
}

export function Row({
  height = ROW_HEIGHT,
  children,
}: {
  height?: number;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        height,
        paddingLeft: GUTTER,
        paddingRight: GUTTER,
      }}
    >
      {children}
    </div>
  );
}

export function Line({
  theme,
  lead,
  size = 16,
  children,
}: Themed & { lead?: ReactNode; size?: number; children: ReactNode }) {
  const c = palette(theme);
  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        minWidth: 0,
        fontFamily: FONT_STACK.body,
        fontWeight: FONTS.body.weight,
        fontSize: size,
        lineHeight: 1.3,
        textWrap: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {lead && <span style={{ color: c.muted }}>{lead}</span>}
      <span style={{ color: c.foreground }}>{children}</span>
    </div>
  );
}

export function Pill({
  theme,
  accent = false,
  children,
}: Themed & { accent?: boolean; children: ReactNode }) {
  const c = palette(theme);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 26,
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 6,
        border: `1px solid ${accent ? c.brandBorder : c.line}`,
        backgroundColor: accent ? c.brandWash : c.surface,
      }}
    >
      <Label theme={theme} tone={accent ? "accent" : "muted"}>
        {children}
      </Label>
    </div>
  );
}

export function Hairline({ theme }: Themed) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        height: 1,
        backgroundColor: palette(theme).hairline,
      }}
    />
  );
}

export function Grid({
  theme,
  levels,
  cell,
  gap,
}: Themed & { levels: number[][]; cell: number; gap: number }) {
  const { ramp } = palette(theme);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {levels.map((row, y) => (
        <div key={y} style={{ display: "flex", gap }}>
          {row.map((level, x) => (
            <div
              key={x}
              style={{
                width: cell,
                height: cell,
                borderRadius: Math.round(cell / 5),
                backgroundColor:
                  level < 0
                    ? "transparent"
                    : ramp[Math.min(level, ramp.length - 1)],
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Legend({ theme, cell = 10 }: Themed & { cell?: number }) {
  const { ramp } = palette(theme);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Label theme={theme}>Less</Label>
      <div style={{ display: "flex", gap: 3 }}>
        {ramp.map((color) => (
          <div
            key={color}
            style={{
              width: cell,
              height: cell,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        ))}
      </div>
      <Label theme={theme}>More</Label>
    </div>
  );
}
