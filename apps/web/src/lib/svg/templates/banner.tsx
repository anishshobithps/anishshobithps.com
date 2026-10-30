import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties, ReactNode } from "react";
import { z } from "zod";
import { siteConfig } from "@repo/site-config";
import { FONT_STACK, FONTS } from "@/lib/svg/fonts";
import { palette } from "@/lib/svg/palette";
import { Label, truncate } from "@/lib/svg/primitives";
import { CARD_WIDTH, defineTemplate, type Theme } from "@/lib/svg/template";

const SIZE = { width: CARD_WIDTH, height: 280 };

/**
 * Cropped from `public/profile.avif` (6000×4000): full width, rows 400–4000,
 * resized to 780×468 (2x the frame below), WebP q78.
 */
let photo: string | undefined;
function profilePhoto() {
  photo ??= `data:image/webp;base64,${readFileSync(
    join(process.cwd(), "src/lib/svg/media/profile-banner.webp"),
  ).toString("base64")}`;
  return photo;
}

/** The old README header's photo frame: a clipped top-left corner and a step cut out of the bottom right. */
const FRAME = {
  viewBox: "37.5 38.605 500.86 300.62",
  path: "M167.523 38.605h328.461c23.442 0 42.375 18.934 42.375 42.372V233.14c0 23.437-18.933 42.37-42.375 42.37h-83.742c-12.922 0-25.242 5.91-33.258 16.13l-24.941 31.453c-8.016 10.117-20.234 16.129-33.258 16.129H79.871c-23.437 0-42.371-18.934-42.371-42.375V147.09c0-13.32 6.21-25.844 16.828-33.856l87.652-66.113c7.313-5.512 16.329-8.516 25.543-8.516",
  left: 28,
  top: 28,
  width: 374,
  height: 224,
};

const ARROW = "M14 4H36V26L29.5 19.5L11 38L2 29L20.5 10.5Z";

function At({
  left,
  top,
  style,
  children,
}: {
  left: number;
  top: number;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "absolute", left, top, display: "flex", ...style }}>
      {children}
    </div>
  );
}

/** Three half-discs in a row, flat side left, like a play-forward mark. */
function Discs({ radius, color }: { radius: number; color: string }) {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: radius,
            height: radius * 2,
            borderRadius: `0 ${radius}px ${radius}px 0`,
            backgroundColor: color,
          }}
        />
      ))}
    </>
  );
}

function Photo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={FRAME.width}
      height={FRAME.height}
      viewBox={FRAME.viewBox}
    >
      <defs>
        <clipPath id="frame">
          <path d={FRAME.path} />
        </clipPath>
      </defs>
      <image
        href={profilePhoto()}
        x={37.5}
        y={38.605}
        width={500.86}
        height={300.62}
        clipPath="url(#frame)"
      />
    </svg>
  );
}

function Name({ theme, lines }: { theme: Theme; lines: string[] }) {
  const sizes = [104, 68, 68];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        fontFamily: FONT_STACK.display,
        fontWeight: FONTS.display.weight,
        letterSpacing: "-0.03em",
        color: palette(theme).foreground,
      }}
    >
      {lines.map((line, index) => (
        <span
          key={line}
          style={{
            fontSize: sizes[index] ?? sizes.at(-1),
            lineHeight: 0.86,
            textWrap: "nowrap",
          }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}

/** "Anish Shobith P S" stacks as "Anish" / "Shobith" / "P S". */
function nameLines(name: string) {
  const [first = "", second, ...rest] = name.split(/\s+/);
  return [first, second, rest.join(" ")].filter((line): line is string => Boolean(line));
}

export const banner = defineTemplate({
  params: z.object({
    role: z
      .string()
      .trim()
      .min(1)
      .max(24)
      .default(siteConfig.role),
  }),
  size: () => SIZE,
  fixtures: [
    { label: "Default", query: {}, data: undefined },
    { label: "Another role", query: { role: "Full Stack Developer" }, data: undefined },
  ],
  render: ({ params, theme }) => {
    const c = palette(theme);
    // The darker green reads as a solid on white; on GitHub's dark canvas the lighter one carries.
    const accent = theme === "dark" ? c.brandText : c.brand;
    const PILL = { width: 172, height: 34 };
    return (
      <div style={{ position: "relative", display: "flex", ...SIZE }}>
        <At left={FRAME.left} top={FRAME.top}>
          <Photo />
        </At>
        <At left={28} top={28}>
          <Discs radius={20} color={accent} />
        </At>
        <At left={382} top={140}>
          <Discs radius={34} color={accent} />
        </At>
        <At left={0} top={30} style={{ width: 762, justifyContent: "flex-end" }}>
          <Name theme={theme} lines={nameLines(siteConfig.name)} />
        </At>
        <At left={338} top={222}>
          <span
            style={{
              fontFamily: FONT_STACK.display,
              fontWeight: FONTS.display.weight,
              fontSize: 28,
              lineHeight: 1,
              letterSpacing: "-0.01em",
              color: c.foreground,
            }}
          >
            {siteConfig.domain}
          </span>
        </At>
        <At left={778} top={34}>
          <svg xmlns="http://www.w3.org/2000/svg" width={34} height={34} viewBox="0 0 40 40">
            <path d={ARROW} fill={accent} />
          </svg>
        </At>
        {/* A horizontal pill turned a quarter, centred on the column under the arrow. */}
        <At
          left={795 - PILL.width / 2}
          top={166 - PILL.height / 2}
          style={{
            ...PILL,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: PILL.height / 2,
            border: `1.5px solid ${c.foreground}`,
            transform: "rotate(-90deg)",
          }}
        >
          <Label theme={theme} tone="strong">
            {truncate(params.role, 24)}
          </Label>
        </At>
      </div>
    );
  },
});
