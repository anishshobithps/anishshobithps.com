"use client";

import { cn } from "@/lib/cn";
import { forwardRef, SVGProps } from "react";

export interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showWordmark?: boolean;
  full?: boolean;
  copyOnClick?: boolean;
}

const FONT_SIZE = 46;
const TEXT_X = 50;
const TEXT_Y = 57;
const CHAR_W = 0.52;
const VB_HEIGHT = 64;
const CROP_LEFT = 14;

function textWidth(str: string) {
  return Math.ceil(str.length * CHAR_W * FONT_SIZE);
}

const VB = {
  icon: { x: CROP_LEFT, w: 64 - CROP_LEFT },
  wordmark: { x: CROP_LEFT, w: TEXT_X + textWidth("nish") - CROP_LEFT },
  full: { x: CROP_LEFT, w: TEXT_X + textWidth("nish Shobith P S") - CROP_LEFT },
} as const;

export const Logo = forwardRef<SVGSVGElement, LogoProps>(
  (
    {
      className,
      size = 64,
      showWordmark = false,
      full = false,
      copyOnClick = false,
      ...props
    },
    ref,
  ) => {
    const vb = showWordmark ? (full ? VB.full : VB.wordmark) : VB.icon;
    const wordmark = showWordmark ? (full ? "nish Shobith P S" : "nish") : null;
    const label = "Anish Shobith P S";
    const scaledWidth = Math.round((vb.w / VB_HEIGHT) * size);

    return (
      <svg
        ref={ref}
        role="img"
        aria-label={label}
        viewBox={`${vb.x} 0 ${vb.w} ${VB_HEIGHT}`}
        width={scaledWidth}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("transition-colors select-none", className)}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (copyOnClick) {
            navigator.clipboard.writeText(label);
          }
        }}
        {...props}
      >
        {/* Glyph */}
        <polygon
          points="32,4 48,60 40.5,60 32,14 23.5,60 16,60"
          className="fill-current"
        />
        <rect
          x="18"
          y="36"
          width="11"
          height="5"
          rx="2.5"
          className="fill-current"
        />
        <rect
          x="35"
          y="36"
          width="11"
          height="5"
          rx="2.5"
          className="fill-current"
        />

        {/* Wordmark */}
        {wordmark && (
          <text
            x={TEXT_X}
            y={TEXT_Y}
            fontFamily="'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif"
            fontSize={FONT_SIZE}
            fontWeight={600}
            letterSpacing="-0.03em"
            className="fill-current"
          >
            {wordmark}
          </text>
        )}
      </svg>
    );
  },
);

Logo.displayName = "Logo";
