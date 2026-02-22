"use client";

import { cn } from "@/lib/cn";
import { forwardRef, SVGProps } from "react";
import { LogoIcon } from "@/components/shared/logo-icon";

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
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      ...props
    },
    ref,
  ) => {
    const isHidden = ariaHidden === true || ariaHidden === "true";

    if (!showWordmark) {
      return (
        <LogoIcon
          size={size}
          className={cn(
            "transition-colors select-none",
            copyOnClick && "cursor-pointer",
            className,
          )}
          aria-label={
            isHidden
              ? undefined
              : ((ariaLabel as string) ?? "Anish Shobith P S")
          }
          aria-hidden={isHidden ? true : undefined}
          onClick={() => {
            if (copyOnClick) navigator.clipboard.writeText("Anish Shobith P S");
          }}
        />
      );
    }

    const wordmark = full ? "nish Shobith P S" : "nish";
    const vb = full ? VB.full : VB.wordmark;
    const defaultLabel = "Anish Shobith P S";
    const scaledWidth = Math.round((vb.w / VB_HEIGHT) * size);

    return (
      <svg
        ref={ref}
        role={isHidden ? undefined : "img"}
        aria-label={isHidden ? undefined : (ariaLabel ?? defaultLabel)}
        aria-hidden={isHidden ? true : undefined}
        viewBox={`${vb.x} 0 ${vb.w} ${VB_HEIGHT}`}
        width={scaledWidth}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "transition-colors select-none cursor-pointer",
          className,
        )}
        onClick={() => {
          if (copyOnClick) navigator.clipboard.writeText(defaultLabel);
        }}
        {...props}
      >
        {!isHidden && <title>{ariaLabel ?? defaultLabel}</title>}
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
      </svg>
    );
  },
);

Logo.displayName = "Logo";
