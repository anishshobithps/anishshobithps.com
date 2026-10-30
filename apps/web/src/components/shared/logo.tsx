"use client";

import { cn } from "@/lib/cn";
import { forwardRef, SVGProps, useEffect, useRef, useState } from "react";
import { LogoIcon } from "@/components/shared/logo-icon";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export interface LogoProps extends SVGProps<SVGSVGElement> {
  size?: number;
  showWordmark?: boolean;
  full?: boolean;
  alive?: boolean;
}

const ICON_CENTER = 32;
const FONT_SIZE = 46;
const TEXT_X = ICON_CENTER + 18;
const TEXT_Y = 57;
const VB_HEIGHT = 64;
const PADDING = 4;
const CONTENT_LEFT = 16;
const CHAR_W = 0.52;
const EYE_Y = 38.5;
const LOOK_X = 2.5;
const LOOK_Y = 1.6;
const LOOK_REACH = 220;
const EYES = [23.5, 40.5];

const eyeSwap =
  "[transform-box:fill-box] origin-center transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.2,0,0,1)]";

function LiveEyes({ eyesRef }: { eyesRef: React.Ref<SVGGElement> }) {
  return (
    <g
      ref={eyesRef}
      className="transition-[translate] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
    >
      {EYES.map((cx) => (
        <g
          key={cx}
          className={cn(
            eyeSwap,
            "group-hover/logo:scale-25 group-hover/logo:opacity-0 group-focus-visible/logo:scale-25 group-focus-visible/logo:opacity-0",
          )}
        >
          <rect
            x={cx - 5.5}
            y={EYE_Y - 2.5}
            width="11"
            height="5"
            rx="2.5"
            className="fill-current [transform-box:fill-box] origin-center animate-mascot-blink"
          />
        </g>
      ))}
      {EYES.map((cx) => (
        <path
          key={cx}
          d={`M${cx - 5} 40 Q${cx} 33 ${cx + 5} 40`}
          strokeWidth="3"
          strokeLinecap="round"
          className={cn(
            eyeSwap,
            "scale-25 stroke-current opacity-0 group-hover/logo:scale-100 group-hover/logo:opacity-100 group-focus-visible/logo:scale-100 group-focus-visible/logo:opacity-100",
          )}
        />
      ))}
    </g>
  );
}

function underline(x0: number, x1: number) {
  const w = x1 - x0;
  return `M${x0} 61 C${x0 + w * 0.35} 59.2 ${x0 + w * 0.7} 62.6 ${x1} 60`;
}

export const Logo = forwardRef<SVGSVGElement, LogoProps>(
  (
    {
      className,
      size = 64,
      showWordmark = false,
      full = false,
      alive = false,
      "aria-label": ariaLabel,
      "aria-hidden": ariaHidden,
      ...props
    },
    ref,
  ) => {
    const isHidden = ariaHidden === true || ariaHidden === "true";
    const textRef = useRef<SVGTextElement>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const eyesRef = useRef<SVGGElement>(null);
    const [measuredW, setMeasuredW] = useState<number | null>(null);
    const [textRight, setTextRight] = useState<number | null>(null);
    const reduceMotion = usePrefersReducedMotion();

    const wordmark = full ? "nish Shobith P S" : "nish";
    const defaultLabel = "Anish Shobith P S";
    useEffect(() => {
      const el = textRef.current;
      if (!el) return;
      const measure = () => {
        const bbox = el.getBBox();
        const contentRight = bbox.x + bbox.width;
        setTextRight(contentRight);
        setMeasuredW(contentRight + PADDING - (CONTENT_LEFT - PADDING));
      };
      measure();
      document.fonts?.ready.then(measure).catch(() => {});
    }, [wordmark]);

    useEffect(() => {
      const svg = svgRef.current;
      const eyes = eyesRef.current;
      if (!alive || reduceMotion || !svg || !eyes) return;

      const controller = new AbortController();
      const { signal } = controller;
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const look = () => {
        frame = 0;
        const rect = svg.getBoundingClientRect();
        const unit = rect.height / VB_HEIGHT;
        const originX = svg.viewBox.baseVal.x;
        const cx = rect.left + (ICON_CENTER - originX) * unit;
        const cy = rect.top + EYE_Y * unit;
        const dx = pointerX - cx;
        const dy = pointerY - cy;
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, distance / LOOK_REACH);
        const x = (dx / distance) * LOOK_X * reach;
        const y = (dy / distance) * LOOK_Y * reach;
        eyes.style.translate = `${x.toFixed(2)}px ${y.toFixed(2)}px`;
      };

      window.addEventListener(
        "pointermove",
        (event) => {
          pointerX = event.clientX;
          pointerY = event.clientY;
          if (!frame) frame = requestAnimationFrame(look);
        },
        { signal, passive: true },
      );
      document.documentElement.addEventListener(
        "pointerleave",
        () => {
          cancelAnimationFrame(frame);
          frame = 0;
          eyes.style.translate = "";
        },
        { signal },
      );

      return () => {
        controller.abort();
        cancelAnimationFrame(frame);
      };
    }, [alive, reduceMotion]);

    if (!showWordmark) {
      return (
        <LogoIcon
          ref={ref}
          size={size}
          className={cn("transition-colors select-none", className)}
          aria-label={
            isHidden
              ? undefined
              : ((ariaLabel as string) ?? "Anish Shobith P S")
          }
          aria-hidden={isHidden ? true : undefined}
        />
      );
    }

    const fallbackW =
      TEXT_X +
      Math.ceil(wordmark.length * CHAR_W * FONT_SIZE) +
      PADDING -
      (CONTENT_LEFT - PADDING);
    const vbX = CONTENT_LEFT - PADDING;
    const vbW = measuredW ?? fallbackW;
    const scaledWidth = Math.round((vbW / VB_HEIGHT) * size);

    const mergedRef = (node: SVGSVGElement | null) => {
      svgRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref)
        (ref as React.MutableRefObject<SVGSVGElement | null>).current = node;
    };

    return (
      <svg
        ref={mergedRef}
        role={isHidden ? undefined : "img"}
        aria-label={isHidden ? undefined : (ariaLabel ?? defaultLabel)}
        aria-hidden={isHidden ? true : undefined}
        viewBox={`${vbX} 0 ${vbW} ${VB_HEIGHT}`}
        width={scaledWidth}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("transition-colors select-none", className)}
        {...props}
      >
        {!isHidden && <title>{ariaLabel ?? defaultLabel}</title>}
        {alive ? (
          <g className="transition-[translate] duration-200 ease-[cubic-bezier(0.2,0,0,1)] group-hover/logo:-translate-y-[3px] group-focus-visible/logo:-translate-y-[3px]">
            <polygon
              points="32,4 48,60 40.5,60 32,14 23.5,60 16,60"
              className="fill-current"
            />
            <LiveEyes eyesRef={eyesRef} />
          </g>
        ) : (
          <>
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
          </>
        )}
        <text
          ref={textRef}
          x={TEXT_X}
          y={TEXT_Y}
          fontSize={FONT_SIZE}
          fontWeight={600}
          letterSpacing="-0.03em"
          textAnchor="start"
          dominantBaseline="alphabetic"
          className="fill-current font-display"
        >
          {wordmark}
        </text>
        {alive && textRight !== null && (
          <path
            d={underline(TEXT_X + 1, textRight)}
            pathLength={1}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-(--brand) [stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover/logo:[stroke-dashoffset:0] group-focus-visible/logo:[stroke-dashoffset:0]"
          />
        )}
      </svg>
    );
  },
);

Logo.displayName = "Logo";
