"use client";

import { cn } from "@/lib/cn";
import { forwardRef, SVGProps, useEffect, useRef, useState } from "react";
import { LogoIcon } from "@/components/shared/logo-icon";

export interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showWordmark?: boolean;
  full?: boolean;
  copyOnClick?: boolean;
}

const ICON_CENTER = 32;
const FONT_SIZE = 46;
const TEXT_X = ICON_CENTER + 18;
const TEXT_Y = 57;
const VB_HEIGHT = 64;
const PADDING = 4;
const CONTENT_LEFT = 16;
const CHAR_W = 0.52;

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
    const textRef = useRef<SVGTextElement>(null);
    const [measuredW, setMeasuredW] = useState<number | null>(null);

    const wordmark = full ? "nish Shobith P S" : "nish";
    const defaultLabel = "Anish Shobith P S";
    useEffect(() => {
      if (!textRef.current) return;
      const bbox = textRef.current.getBBox();
      const contentRight = bbox.x + bbox.width;
      setMeasuredW(contentRight + PADDING - (CONTENT_LEFT - PADDING));
    }, [wordmark]);

    if (!showWordmark) {
      return (
        <LogoIcon
          ref={ref}
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

    const fallbackW =
      TEXT_X +
      Math.ceil(wordmark.length * CHAR_W * FONT_SIZE) +
      PADDING -
      (CONTENT_LEFT - PADDING);
    const vbX = CONTENT_LEFT - PADDING; // = 12
    const vbW = measuredW ?? fallbackW;
    const scaledWidth = Math.round((vbW / VB_HEIGHT) * size);

    const mergedRef = (node: SVGSVGElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<SVGSVGElement | null>).current = node;
    };

    return (
      <svg
        ref={mergedRef}
        role={isHidden ? undefined : copyOnClick ? "button" : "img"}
        aria-label={isHidden ? undefined : (ariaLabel ?? defaultLabel)}
        aria-hidden={isHidden ? true : undefined}
        tabIndex={copyOnClick ? 0 : undefined}
        viewBox={`${vbX} 0 ${vbW} ${VB_HEIGHT}`}
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
        onKeyDown={(e) => {
          if (copyOnClick && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            navigator.clipboard.writeText(defaultLabel);
          }
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
          ref={textRef}
          x={TEXT_X}
          y={TEXT_Y}
          fontFamily="'Geist', 'Geist Fallback', ui-sans-serif, system-ui, sans-serif"
          fontSize={FONT_SIZE}
          fontWeight={600}
          letterSpacing="-0.03em"
          textAnchor="start"
          dominantBaseline="alphabetic"
          className="fill-current"
        >
          {wordmark}
        </text>
      </svg>
    );
  },
);

Logo.displayName = "Logo";
