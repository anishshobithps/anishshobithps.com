"use client";

import { ArrowRightIcon } from "@/components/shared/icons";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const PHRASES = [
  "Available for hire",
  "Open to full-time roles",
  "Accepting side quests",
  "Will ship for ice cream",
];

function NeonSign() {
  return (
    <svg viewBox="0 0 44 30" aria-hidden="true" className="h-7.5 w-11 shrink-0 overflow-visible">
      <circle cx="22" cy="2.5" r="1.6" className="fill-muted-foreground" />
      <g className="neon-swing">
        <path
          d="M22 2.5 L9 11 M22 2.5 L35 11"
          fill="none"
          strokeWidth="0.8"
          className="stroke-muted-foreground"
        />
        <g className="neon-glow">
          <rect
            x="3"
            y="11"
            width="38"
            height="17"
            rx="3.5"
            fill="none"
            strokeWidth="1.4"
            className="stroke-(--color-available)"
          />
          <text
            x="22"
            y="19.8"
            fontSize="9"
            textAnchor="middle"
            dominantBaseline="central"
            className="iso-label fill-(--color-available)"
          >
            Open
          </text>
        </g>
      </g>
    </svg>
  );
}

export function HireSign() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % PHRASES.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href="#contact"
      aria-label="Available for hire, jump to contact"
      className="neon-trigger group inline-flex items-center gap-2.5 rounded-full border border-(--brand)/30 bg-(--brand)/8 py-1 pr-3 pl-1.5 text-xs font-medium text-(--brand-text) transition-colors hover:bg-(--brand)/15"
    >
      <NeonSign />
      <span aria-hidden="true" className="grid overflow-hidden">
        {PHRASES.map((phrase, i) => (
          <span
            key={phrase}
            className={cn(
              "col-start-1 row-start-1 whitespace-nowrap transition-[translate,opacity] duration-500",
              i === index
                ? "translate-y-0 opacity-100"
                : i === (index - 1 + PHRASES.length) % PHRASES.length
                  ? "-translate-y-full opacity-0"
                  : "translate-y-full opacity-0",
            )}
          >
            {phrase}
          </span>
        ))}
      </span>
      <ArrowRightIcon
        aria-hidden="true"
        className="size-3.5 shrink-0 -translate-x-1 opacity-0 transition-[translate,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </a>
  );
}
