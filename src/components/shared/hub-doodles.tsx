"use client";

import { Text } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, type ReactNode } from "react";

const TRACK = "M4 15 C40 10, 80 19, 120 14 S170 11, 184 15";

function readProgress() {
  const article = document.querySelector("article.prose");
  if (!article) return null;
  const rect = article.getBoundingClientRect();
  const seen = window.innerHeight - rect.top;
  return Math.min(1, Math.max(0, seen / rect.height));
}

export function ReadingProgress() {
  const [progress, setProgress] = useState<number | null>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const update = () => setProgress(readProgress());
    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const dot = dotRef.current;
    if (!track || !dot || progress === null) return;
    const point = track.getPointAtLength(track.getTotalLength() * progress);
    dot.setAttribute("cx", point.x.toFixed(2));
    dot.setAttribute("cy", point.y.toFixed(2));
  }, [progress]);

  if (progress === null) return null;

  const percent = Math.round(progress * 100);
  const done = percent >= 98;

  return (
    <div className="flex flex-col gap-1.5">
      <svg
        viewBox="0 0 200 26"
        aria-hidden="true"
        className="h-6.5 w-full overflow-visible"
      >
        <path
          ref={trackRef}
          d={TRACK}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="3 4"
          className="stroke-muted-foreground/40"
        />
        <path
          d={TRACK}
          pathLength={1}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={`${progress} 1`}
          className="stroke-(--brand) transition-[stroke-dasharray] duration-300"
        />
        <g className={cn("hub-flag", done && "hub-flag-done")}>
          <path
            d="M186 15 V2"
            strokeWidth="1.3"
            strokeLinecap="round"
            className="stroke-muted-foreground"
          />
          <path d="M186 2.5 L196 5.5 L186 8.5 Z" className="fill-(--brand)" />
        </g>
        <circle
          ref={dotRef}
          r="4"
          cx="4"
          cy="15"
          className="fill-background stroke-(--brand)"
          strokeWidth="2"
        />
      </svg>
      <Text as="p" variant="muted" className="text-xs tabular-nums">
        {done
          ? "You made it to the end. Respect."
          : `You're ${percent}% through`}
      </Text>
    </div>
  );
}

export function CommentBubble({ count }: { count: number | null }) {
  const label = count == null ? null : count > 99 ? "99+" : String(count);
  return (
    <svg
      viewBox="0 0 30 26"
      aria-hidden="true"
      className="size-7.5 shrink-0 overflow-visible"
    >
      <path
        d="M4 3 H18 A2 2 0 0 1 20 5 V12 A2 2 0 0 1 18 14 H9 L5 17 V14 H4 A2 2 0 0 1 2 12 V5 A2 2 0 0 1 4 3 Z"
        fill="none"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="stroke-muted-foreground/60"
      />
      <path
        d="M11 8 H26 A2 2 0 0 1 28 10 V19 A2 2 0 0 1 26 21 H25 V24 L21 21 H11 A2 2 0 0 1 9 19 V10 A2 2 0 0 1 11 8 Z"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="fill-(--brand) stroke-(--brand)"
      />
      {label ? (
        <text
          x="18.5"
          y="14.8"
          fontSize={label.length > 2 ? 6 : 7.5}
          textAnchor="middle"
          dominantBaseline="central"
          className="font-mono font-semibold fill-neutral-950"
        >
          {label}
        </text>
      ) : (
        <path
          d="M18.5 18 l-3.6 -3.4 a2.1 2.1 0 0 1 3.6 -2.6 a2.1 2.1 0 0 1 3.6 2.6 z"
          className="fill-neutral-950"
        />
      )}
      <path
        d="M24 5.5 l-2.6 -2.4 a1.5 1.5 0 0 1 2.6 -1.9 a1.5 1.5 0 0 1 2.6 1.9 z"
        className="hub-heart fill-rose-500"
      />
    </svg>
  );
}

interface PassProps {
  stub: ReactNode;
  children: ReactNode;
}

export function Pass({ stub, children }: PassProps) {
  return (
    <div className="flex items-stretch rounded-lg border border-border bg-muted/30 [--notch:3.5rem] [mask-image:radial-gradient(circle_6px_at_var(--notch)_0,transparent_97%,black),radial-gradient(circle_6px_at_var(--notch)_100%,transparent_97%,black)] [mask-composite:intersect]">
      <div className="flex w-(--notch) shrink-0 items-center justify-center border-r border-dashed border-border">
        {stub}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3">
        {children}
      </div>
    </div>
  );
}

export function EmptyAvatar() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8">
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="none"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        className="stroke-muted-foreground/50"
      />
      <circle cx="16" cy="13" r="4.5" className="fill-muted-foreground/30" />
      <path
        d="M8.5 25 C10 20, 22 20, 23.5 25"
        className="fill-muted-foreground/30"
      />
    </svg>
  );
}
