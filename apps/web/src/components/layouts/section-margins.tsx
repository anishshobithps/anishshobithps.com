"use client";

import { SectionLabel } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useEffect, useId, useRef, useState } from "react";

const RULER_STEP = 80;
const LENS = 144;

const tint = "transition-[stroke] duration-300 ease-out";
const brandDraw =
  "stroke-(--brand) [stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.2,0,0,1)] group-data-active/margins:[stroke-dashoffset:0]";

interface SectionMarginsProps {
  label?: string;
  index?: string;
  demo?: boolean;
}

export function SectionMargins({
  label,
  index,
  demo = false,
}: SectionMarginsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const lensRef = useRef<SVGRectElement>(null);
  const readoutRef = useRef<SVGTextElement>(null);
  const [height, setHeight] = useState(0);
  const [active, setActive] = useState(false);
  const uid = useId().replace(/[^\w-]/g, "");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const resize = new ResizeObserver(([entry]) =>
      setHeight(Math.round(entry.contentRect.height)),
    );
    resize.observe(root);

    const spy = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "-50% 0px -50% 0px" },
    );
    spy.observe(root);

    return () => {
      resize.disconnect();
      spy.disconnect();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!active || !root) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const y = Math.min(
        rect.height,
        Math.max(0, window.innerHeight / 2 - rect.top),
      );
      const offset = `0 ${y.toFixed(1)}px`;
      if (headRef.current) headRef.current.style.translate = offset;
      if (lensRef.current) lensRef.current.style.translate = offset;
      if (readoutRef.current)
        readoutRef.current.textContent = String(Math.round(y));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [active]);

  const marks = [];
  for (let y = RULER_STEP; y < height - 12; y += RULER_STEP) marks.push(y);

  const ids = {
    minor: `${uid}-minor`,
    major: `${uid}-major`,
    minorLit: `${uid}-minor-lit`,
    majorLit: `${uid}-major-lit`,
    fade: `${uid}-fade`,
    lens: `${uid}-lens`,
  };

  const dimension = [label, height ? `${height}px` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      data-active={active || undefined}
      className={cn(
        "group/margins pointer-events-none absolute inset-0",
        !demo && "hidden xl:block",
      )}
    >
      <div className="absolute inset-y-0 right-full w-22">
        <svg className="absolute inset-0 size-full overflow-hidden">
          <defs>
            <pattern
              id={ids.minor}
              width="88"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path d="M82 0.5 H88" className="stroke-foreground/15" />
            </pattern>
            <pattern
              id={ids.major}
              width="88"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M76 0.5 H88" className="stroke-foreground/25" />
            </pattern>
            <pattern
              id={ids.minorLit}
              width="88"
              height="8"
              patternUnits="userSpaceOnUse"
            >
              <path d="M80 0.5 H88" className="stroke-(--brand)" />
            </pattern>
            <pattern
              id={ids.majorLit}
              width="88"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path d="M72 0.5 H88" className="stroke-(--brand)" />
            </pattern>
            <linearGradient id={ids.fade} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="0.5" stopColor="currentColor" stopOpacity="1" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <mask id={ids.lens} mask-type="alpha">
              <rect
                ref={lensRef}
                x="0"
                y={-LENS / 2}
                width="88"
                height={LENS}
                fill={`url(#${ids.fade})`}
              />
            </mask>
          </defs>

          <rect width="100%" height="100%" fill={`url(#${ids.minor})`} />
          <rect width="100%" height="100%" fill={`url(#${ids.major})`} />

          <g
            mask={`url(#${ids.lens})`}
            className="opacity-0 transition-opacity duration-300 ease-out group-data-active/margins:opacity-100"
          >
            <rect width="100%" height="100%" fill={`url(#${ids.minorLit})`} />
            <rect width="100%" height="100%" fill={`url(#${ids.majorLit})`} />
          </g>

          {marks.map((y) => (
            <text
              key={y}
              x="70"
              y={y + 0.5}
              fontSize="9"
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground/50 font-pixel"
            >
              {y}
            </text>
          ))}

          <g
            ref={headRef}
            className="opacity-0 transition-opacity duration-300 ease-out group-data-active/margins:opacity-100"
          >
            <path d="M42 0.5 H86" className="stroke-(--brand)" />
            <path d="M88 0.5 L82 -3 V4 Z" className="fill-(--brand)" />
            <text
              ref={readoutRef}
              x="38"
              y="0.5"
              fontSize="10"
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-(--brand-text) font-pixel"
            >
              0
            </text>
          </g>
        </svg>
      </div>

      <div className="absolute inset-y-0 left-full w-22">
        <svg className="absolute inset-0 size-full overflow-hidden">
          <line
            x1="0"
            x2="40"
            y1="0.5"
            y2="0.5"
            className={cn(
              tint,
              "stroke-foreground/15 group-data-active/margins:stroke-(--brand)/60",
            )}
          />
          <svg y="100%" overflow="visible">
            <line
              x1="0"
              x2="40"
              y1="-0.5"
              y2="-0.5"
              className={cn(
                tint,
                "stroke-foreground/15 group-data-active/margins:stroke-(--brand)/60",
              )}
            />
            <path
              d="M24.5 -1 L21.5 -9 H27.5 Z"
              className="fill-foreground/25 transition-[fill] duration-300 ease-out group-data-active/margins:fill-(--brand)"
            />
          </svg>
          <path
            d="M24.5 1 L21.5 9 H27.5 Z"
            className="fill-foreground/25 transition-[fill] duration-300 ease-out group-data-active/margins:fill-(--brand)"
          />
          <line
            x1="24.5"
            x2="24.5"
            y1="0"
            y2="100%"
            className="stroke-foreground/15"
          />
          <line
            x1="24.5"
            x2="24.5"
            y1="50%"
            y2="0"
            pathLength={1}
            className={brandDraw}
          />
          <line
            x1="24.5"
            x2="24.5"
            y1="50%"
            y2="100%"
            pathLength={1}
            className={brandDraw}
          />
          <path
            d="M40 0.5 L50 11"
            className={cn(
              tint,
              "stroke-foreground/15 group-data-active/margins:stroke-(--brand)/60",
            )}
          />
        </svg>

        <span
          className={cn(
            "absolute top-2 left-12 grid size-6 place-items-center rounded-full border bg-background transition-[border-color,background-color] duration-300 ease-out",
            active ? "border-(--brand) bg-(--brand)/10" : "border-line",
          )}
        >
          <SectionLabel pixel accent={active} asChild>
            <span data-slot="section-index">{index}</span>
          </SectionLabel>
        </span>

        {dimension && (
          <span className="absolute top-1/2 left-6 -translate-1/2 bg-background py-3">
            <SectionLabel pixel accent={active} asChild>
              <span data-slot="section-dimension">{dimension}</span>
            </SectionLabel>
          </span>
        )}
      </div>
    </div>
  );
}
