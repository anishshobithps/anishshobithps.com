import { SectionLabel } from "@/components/ui/typography";
import type { CSSProperties } from "react";

function delay(ms: number) {
  return { "--nudge-delay": `${ms}ms` } as CSSProperties;
}

const stroke = {
  fill: "none",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function PhotoCallout() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-full left-[43%] mb-1 flex items-start gap-1"
    >
      <svg viewBox="0 0 28 38" className="h-9.5 w-7 shrink-0 overflow-visible">
        <path
          d="M26 6 C14 6, 5 14, 4 35 M0.5 29 L4 35 L8.5 29.5"
          pathLength={1}
          className="nudge-draw stroke-(--brand)"
          style={delay(900)}
          {...stroke}
        />
      </svg>
      <SectionLabel
        pixel
        className="-mt-0.5 max-w-64 text-balance text-(--brand-text) animate-in fade-in-0 duration-500 fill-mode-backwards [animation-delay:700ms]"
      >
        <span className="dark:hidden">that&apos;s me. face still loading…</span>
        <span className="hidden dark:inline">
          dark mode on. now I&apos;m fully invisible
        </span>
      </SectionLabel>
    </div>
  );
}

export function IceCreamNote() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg viewBox="0 0 16 24" aria-hidden="true" className="h-6 w-4 overflow-visible">
        <path d="M3.5 11 L8 22.5 L12.5 11 Z" className="fill-(--brand)/10 stroke-muted-foreground" strokeWidth="1" strokeLinejoin="round" />
        <path d="M5.2 13 L10.6 18 M10.8 13 L5.4 18" className="stroke-muted-foreground/60" strokeWidth="0.7" />
        <circle cx="8" cy="7.5" r="5" className="fill-(--brand)/35 stroke-(--brand)" strokeWidth="1.1" />
        <path d="M10.6 11.3 q0.9 2.2 0 3.2 q-0.8 -0.6 0 -3.2" className="fill-(--brand)/35 stroke-(--brand)" strokeWidth="0.8" />
        <circle cx="6" cy="6" r="0.7" className="fill-foreground/70" />
        <circle cx="9.6" cy="5" r="0.7" className="fill-foreground/70" />
        <circle cx="8.6" cy="9" r="0.7" className="fill-foreground/70" />
        <circle cx="10.6" cy="15.6" r="0.75" className="doodle-drip fill-(--brand)" />
      </svg>
      <SectionLabel pixel asChild aria-hidden={undefined}>
        <span>runs on ice cream</span>
      </SectionLabel>
    </span>
  );
}

export function SocialsNudge() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-full left-4 mt-1 flex items-start gap-1"
    >
      <svg viewBox="0 0 24 28" className="h-7 w-6 overflow-visible">
        <path
          d="M20 26 C10 24, 5 16, 5 3 M1.5 8.5 L5 3 L9 8"
          pathLength={1}
          className="git-draw stroke-(--brand)"
          style={{ "--git-delay": "500ms" } as CSSProperties}
          {...stroke}
        />
      </svg>
      <SectionLabel pixel className="mt-4 text-(--brand-text)">
        DMs are open, I reply
      </SectionLabel>
    </div>
  );
}
