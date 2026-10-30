"use client";

import { SectionLabel } from "@/components/ui/typography";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";
import { useEffect, useId, useState, type SVGProps } from "react";

type Point = [number, number];

const DUR = "4s";
const VB_X = 6;
const VB_Y = -8;
const VB_W = 54;
const VB_H = 74;

const OUTLINE: Point[] = [
  [32, 4],
  [48, 60],
  [40.5, 60],
  [32, 14],
  [23.5, 60],
  [16, 60],
  [32, 4],
];

const SCRIBBLE: Point[] = Array.from({ length: 13 }, (_, i) => {
  const y = 7 + i * 4.4;
  const spread = (16 * (y - 4)) / 56 + 2.5;
  return [i % 2 ? 32 + spread : 32 - spread, y];
});

const SPARKS = [
  "M41 9 L46 5",
  "M43.5 15 L49.5 14",
  "M23 9 L18 5",
  "M20.5 15 L14.5 14",
];

function toPath(points: Point[]) {
  return points
    .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");
}

function length(points: Point[]) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(
      points[i][0] - points[i - 1][0],
      points[i][1] - points[i - 1][1],
    );
  }
  return total;
}

const OUTLINE_D = toPath(OUTLINE);
const SCRIBBLE_D = toPath(SCRIBBLE);
const PENCIL_PATH = `${OUTLINE_D} ${SCRIBBLE_D}`;
const OUTLINE_SHARE = (
  length(OUTLINE) /
  (length(OUTLINE) + length(SCRIBBLE))
).toFixed(4);

const EASE = "0.45 0 0.55 1";
const HOLD = "0 0 1 1";

const loop = {
  dur: DUR,
  repeatCount: "indefinite",
  calcMode: "spline",
} as const;

function Pencil() {
  return (
    <g transform="rotate(-58)">
      <polygon points="0,0 2.4,-0.9 2.4,0.9" className="fill-foreground" />
      <polygon
        points="2.4,-0.9 5.8,-2.1 5.8,2.1 2.4,0.9"
        strokeWidth="0.6"
        strokeLinejoin="round"
        className="fill-background stroke-foreground"
      />
      <rect
        x="5.8"
        y="-2.1"
        width="12"
        height="4.2"
        strokeWidth="0.6"
        className="fill-(--brand) stroke-foreground"
      />
      <path
        d="M6.4 0 H17.2"
        strokeWidth="0.5"
        className="stroke-foreground/35"
      />
      <rect
        x="17.8"
        y="-2.1"
        width="2.2"
        height="4.2"
        strokeWidth="0.6"
        className="fill-muted-foreground stroke-foreground"
      />
      <path
        d="M20 -2.1 H21.4 A1.6 2.1 0 0 1 21.4 2.1 H20 Z"
        strokeWidth="0.6"
        className="fill-(--color-heart)/80 stroke-foreground"
      />
    </g>
  );
}

function Eye({ cx, animate }: { cx: number; animate: boolean }) {
  return (
    <g transform={`translate(${cx} 38.5)`}>
      <g>
        {animate && (
          <>
            <animateTransform
              attributeName="transform"
              type="scale"
              values="0;0;1.2;1;1"
              keyTimes="0;0.62;0.67;0.7;1"
              keySplines={`${HOLD};${EASE};${EASE};${HOLD}`}
              {...loop}
            />
            <animateTransform
              attributeName="transform"
              type="scale"
              additive="sum"
              values="1 1;1 1;1 0.12;1 1;1 1"
              keyTimes="0;0.88;0.895;0.91;1"
              keySplines={`${HOLD};${EASE};${EASE};${HOLD}`}
              {...loop}
            />
          </>
        )}
        <rect
          x="-5.5"
          y="-2.5"
          width="11"
          height="5"
          rx="2.5"
          className="fill-foreground"
        />
      </g>
    </g>
  );
}

export interface LogoLoaderProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function LogoLoader({
  className,
  size = 64,
  ...props
}: LogoLoaderProps) {
  const reduceMotion = usePrefersReducedMotion();
  const animate = !reduceMotion;
  const clipId = `loader-${useId().replace(/[^\w-]/g, "")}`;
  const width = Math.round((VB_W / VB_H) * size);

  return (
    <svg
      aria-hidden="true"
      viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
      width={width}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible select-none", className)}
      {...props}
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={OUTLINE.map((p) => p.join(",")).join(" ")} />
        </clipPath>
      </defs>

      <ellipse
        cx="32"
        cy="63.5"
        rx="15"
        ry="1.8"
        className="fill-foreground/10"
      />

      <g>
        {animate && (
          <animate
            attributeName="opacity"
            values="1;1;0;0"
            keyTimes="0;0.92;0.98;1"
            keySplines={`${HOLD};${EASE};${HOLD}`}
            {...loop}
          />
        )}

        <path
          d={SCRIBBLE_D}
          clipPath={`url(#${clipId})`}
          pathLength={1}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animate ? 1 : undefined}
          strokeDashoffset={animate ? 1 : undefined}
          className="stroke-(--brand)/55"
        >
          {animate && (
            <animate
              attributeName="stroke-dashoffset"
              values="1;1;0;0"
              keyTimes="0;0.39;0.6;1"
              keySplines={`${HOLD};${EASE};${HOLD}`}
              {...loop}
            />
          )}
        </path>

        <path
          d={OUTLINE_D}
          pathLength={1}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={animate ? 1 : undefined}
          strokeDashoffset={animate ? 1 : undefined}
          className="stroke-foreground"
        >
          {animate && (
            <animate
              attributeName="stroke-dashoffset"
              values="1;0;0"
              keyTimes="0;0.36;1"
              keySplines={`${EASE};${HOLD}`}
              {...loop}
            />
          )}
        </path>

        <g>
          {animate && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 0;-1.8 0;-1.8 0;1.8 0;1.8 0;0 0;0 0"
              keyTimes="0;0.73;0.75;0.79;0.81;0.85;0.87;1"
              keySplines={`${HOLD};${EASE};${HOLD};${EASE};${HOLD};${EASE};${HOLD}`}
              {...loop}
            />
          )}
          <Eye cx={23.5} animate={animate} />
          <Eye cx={40.5} animate={animate} />
        </g>

        {SPARKS.map((d) => (
          <path
            key={d}
            d={d}
            pathLength={1}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray={animate ? 1 : undefined}
            strokeDashoffset={animate ? 1 : undefined}
            className="stroke-(--brand)"
          >
            {animate && (
              <animate
                attributeName="stroke-dashoffset"
                values="1;1;0;0"
                keyTimes="0;0.68;0.72;1"
                keySplines={`${HOLD};${EASE};${HOLD}`}
                {...loop}
              />
            )}
          </path>
        ))}
      </g>

      {animate && (
        <g>
          <animateMotion
            path={PENCIL_PATH}
            keyPoints={`0;${OUTLINE_SHARE};${OUTLINE_SHARE};1;1`}
            keyTimes="0;0.36;0.39;0.6;1"
            keySplines={`${EASE};${HOLD};${EASE};${HOLD}`}
            {...loop}
          />
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 0;0 0;5 -7;5 -7"
              keyTimes="0;0.6;0.67;1"
              keySplines={`${HOLD};${EASE};${HOLD}`}
              {...loop}
            />
            <animate
              attributeName="opacity"
              values="0;1;1;0;0"
              keyTimes="0;0.03;0.61;0.67;1"
              keySplines={`${EASE};${HOLD};${EASE};${HOLD}`}
              {...loop}
            />
            <Pencil />
          </g>
        </g>
      )}
    </svg>
  );
}

LogoLoader.displayName = "LogoLoader";

const QUIPS = [
  "sharpening pencils",
  "coloring inside the lines",
  "fetching ice cream",
  "untangling the wires",
  "almost there, probably",
];

interface LoaderCaptionProps {
  phrases?: string[];
  className?: string;
}

export function LoaderCaption({
  phrases = QUIPS,
  className,
}: LoaderCaptionProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % phrases.length),
      2000,
    );
    return () => clearInterval(id);
  }, [reduceMotion, phrases.length]);

  const previous = (index - 1 + phrases.length) % phrases.length;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-in fade-in-0 duration-500 fill-mode-backwards [animation-delay:600ms]",
        className,
      )}
    >
      <SectionLabel
        pixel
        accent
        className="grid justify-items-center overflow-hidden"
      >
        {phrases.map((phrase, i) => (
          <span
            key={phrase}
            className={cn(
              "col-start-1 row-start-1 whitespace-nowrap transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
              i === index
                ? "translate-y-0 opacity-100"
                : i === previous
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0",
            )}
          >
            {phrase}…
          </span>
        ))}
      </SectionLabel>
    </div>
  );
}
