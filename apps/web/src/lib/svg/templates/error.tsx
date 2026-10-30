import { escapeXml } from "@/lib/xml";
import {
  Body,
  Cell,
  Frame,
  GUTTER,
  Label,
  truncate,
} from "@/lib/svg/primitives";
import { CARD_WIDTH, type Theme } from "@/lib/svg/template";

export type SvgErrorKind =
  | "unknown-type"
  | "bad-params"
  | "data-unavailable"
  | "render-failed";

const TITLES: Record<SvgErrorKind, string> = {
  "unknown-type": "Unknown card",
  "bad-params": "Bad parameters",
  "data-unavailable": "Data unavailable",
  "render-failed": "Render failed",
};

export const ERROR_SIZE = { width: CARD_WIDTH, height: 92 } as const;

export function ErrorCard({
  theme,
  kind,
  message,
}: {
  theme: Theme;
  kind: SvgErrorKind;
  message: string;
}) {
  return (
    <Frame theme={theme} {...ERROR_SIZE}>
      <Cell
        theme={theme}
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
          paddingLeft: GUTTER,
          paddingRight: GUTTER,
        }}
      >
        <Label theme={theme} tone="accent">
          {`svg card · ${TITLES[kind]}`}
        </Label>
        <Body theme={theme} lines={1}>
          {truncate(message, 110)}
        </Body>
      </Cell>
    </Frame>
  );
}

export function fallbackErrorSvg(message: string) {
  const { width, height } = ERROR_SIZE;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="none" stroke="gray"/>`,
    `<text x="${GUTTER}" y="${height / 2 + 5}" font-family="monospace" font-size="14" fill="gray">${escapeXml(truncate(message, 90))}</text>`,
    `</svg>`,
  ].join("");
}
