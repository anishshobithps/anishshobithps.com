import { SectionLabel } from "@/components/ui/typography";
import { gitDraw, isoType, nudgeDraw } from "@/components/diagrams/classes";
import { MascotFigure, type MascotEyes } from "@/components/shared/logo-mascot";
import { cn } from "@/lib/cn";
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
          className={cn(nudgeDraw, "stroke-(--brand)")}
          // eslint-disable-next-line shadcn/no-inline-styles
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
      <svg
        viewBox="0 0 16 24"
        aria-hidden="true"
        className="h-6 w-4 overflow-visible"
      >
        <path
          d="M3.5 11 L8 22.5 L12.5 11 Z"
          className="fill-(--brand)/10 stroke-muted-foreground"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <path
          d="M5.2 13 L10.6 18 M10.8 13 L5.4 18"
          className="stroke-muted-foreground/60"
          strokeWidth="0.7"
        />
        <circle
          cx="8"
          cy="7.5"
          r="5"
          className="fill-(--brand)/35 stroke-(--brand)"
          strokeWidth="1.1"
        />
        <path
          d="M10.6 11.3 q0.9 2.2 0 3.2 q-0.8 -0.6 0 -3.2"
          className="fill-(--brand)/35 stroke-(--brand)"
          strokeWidth="0.8"
        />
        <circle cx="6" cy="6" r="0.7" className="fill-foreground/70" />
        <circle cx="9.6" cy="5" r="0.7" className="fill-foreground/70" />
        <circle cx="8.6" cy="9" r="0.7" className="fill-foreground/70" />
        <circle
          cx="10.6"
          cy="15.6"
          r="0.75"
          className="[transform-box:fill-box] animate-doodle-drip fill-(--brand)"
        />
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
          className={cn(gitDraw, "stroke-(--brand)")}
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

export function ThemeNudge() {
  return (
    <div aria-hidden="true" className="flex items-center gap-1.5">
      <SectionLabel pixel className="text-(--brand-text)">
        <span className="dark:hidden">lights off?</span>
        <span className="hidden dark:inline">lights on?</span>
      </SectionLabel>
      <svg viewBox="0 0 34 22" className="h-5.5 w-8.5 overflow-visible">
        <path
          d="M2 16 C10 20, 22 18, 31 9 M24.5 8.5 L31 9 L30 15.5"
          className="stroke-(--brand)"
          {...stroke}
        />
      </svg>
    </div>
  );
}

export function HoverNudge() {
  return (
    <div aria-hidden="true" className="flex items-start gap-1">
      <svg viewBox="0 0 24 28" className="h-7 w-6 overflow-visible">
        <path
          d="M20 26 C10 24, 5 16, 5 3 M1.5 8.5 L5 3 L9 8"
          className="stroke-(--brand)"
          {...stroke}
        />
      </svg>
      <SectionLabel pixel accent className="mt-4">
        hover me
      </SectionLabel>
    </div>
  );
}

export function GroupGlyph({ variant }: { variant: "pages" | "site" }) {
  if (variant === "site") {
    return (
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="size-3.5 shrink-0 overflow-visible"
      >
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="1.3"
          className="stroke-muted-foreground/50"
        />
        <path d="M8 8 L10.8 5.2 L9 9 Z" className="fill-(--brand)" />
        <path d="M8 8 L5.2 10.8 L7 7 Z" className="fill-muted-foreground/60" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-3.5 shrink-0 overflow-visible"
    >
      <rect
        x="4.5"
        y="2.5"
        width="9"
        height="10.5"
        rx="1"
        fill="none"
        strokeWidth="1.2"
        className="stroke-muted-foreground/50"
      />
      <rect
        x="2.5"
        y="4.5"
        width="9"
        height="10.5"
        rx="1"
        strokeWidth="1.2"
        className="fill-background stroke-(--brand)"
      />
      <path
        d="M4.7 8 H8.3 M4.7 10.3 H7"
        strokeWidth="1"
        strokeLinecap="round"
        className="stroke-(--brand)/70"
      />
    </svg>
  );
}

export function OnlinePing() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-3.5 shrink-0 overflow-visible"
    >
      <circle
        cx="8"
        cy="8"
        r="5"
        strokeWidth="1"
        // eslint-disable-next-line shadcn/no-raw-colors
        className="fill-none stroke-(--brand) [transform-box:fill-box] origin-center animate-iso-ripple"
      />
      <circle
        cx="8"
        cy="8"
        r="2.2"
        className="fill-(--brand) animate-iso-twinkle"
      />
    </svg>
  );
}

export function Signpost() {
  return (
    <svg
      viewBox="0 0 288 248"
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-visible"
    >
      <ellipse
        cx="144"
        cy="226"
        rx="112"
        ry="9"
        className="fill-foreground/5"
      />
      <path
        d="M70 226 q3 -9 6 0 q3 -12 6 0 M196 225 q3 -8 6 0 q3 -11 6 0 q3 -7 6 0"
        fill="none"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="stroke-(--brand)/60"
      />
      <path d="M131 14 L144 4 L157 14 Z" className="fill-muted-foreground/60" />
      <rect
        x="138"
        y="14"
        width="12"
        height="214"
        rx="2"
        className="fill-muted stroke-foreground/20"
      />
      <path
        d="M142 30 V210 M146 60 V190"
        strokeWidth="0.8"
        className="stroke-foreground/10"
      />
      <g className="animate-pin-bounce">
        <path
          d="M232 222 c-6 -7 -9 -11 -9 -15 a9 9 0 0 1 18 0 c0 4 -3 8 -9 15 z"
          className="fill-(--brand)"
        />
        <circle cx="232" cy="207" r="3" className="fill-background" />
      </g>
      <text
        x="232"
        y="242"
        fontSize="8"
        textAnchor="middle"
        className={`${isoType} fill-muted-foreground`}
      >
        you are here
      </text>
    </svg>
  );
}

export function CricketDoodle() {
  return (
    <svg
      viewBox="0 0 64 44"
      aria-hidden="true"
      className="h-12 w-17 overflow-visible"
    >
      <g
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M24 15 Q28 11 32 15"
          className="animate-chirp stroke-(--brand)"
        />
        <path
          d="M20.5 11 Q28 4 35.5 11"
          className="animate-chirp stroke-(--brand)"
          style={{ animationDelay: "200ms" }}
        />
        <path
          d="M47 19 Q52 8 60 6 M45 19 Q47 9 53 4"
          className="stroke-muted-foreground"
        />
        <path
          d="M24 28 L16 18 L10 32 M36 31 L34 37 M41 29 L43 36 M29 32 L27 38"
          className="stroke-muted-foreground"
        />
      </g>
      <ellipse
        cx="30"
        cy="26"
        rx="13"
        ry="6.5"
        strokeWidth="1.5"
        className="fill-(--brand)/15 stroke-(--brand)"
      />
      <path
        d="M20 24.5 Q30 20 42 25"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="stroke-(--brand)"
      />
      <circle
        cx="45"
        cy="23"
        r="4.5"
        strokeWidth="1.5"
        className="fill-(--brand)/15 stroke-(--brand)"
      />
      <circle cx="46.5" cy="22" r="0.9" className="fill-foreground" />
    </svg>
  );
}

export function TypingBubble() {
  return (
    <svg
      viewBox="0 0 40 30"
      aria-hidden="true"
      className="h-7.5 w-10 shrink-0 overflow-visible"
    >
      <path
        d="M6 3 H34 A4 4 0 0 1 38 7 V19 A4 4 0 0 1 34 23 H14 L8 28 V23 H6 A4 4 0 0 1 2 19 V7 A4 4 0 0 1 6 3 Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
        className="fill-muted/60 stroke-muted-foreground/60"
      />
      {[12, 20, 28].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy="13"
          r="2"
          className="animate-typing-dot fill-(--brand)"
          style={{ animationDelay: `${i * 160}ms` }}
        />
      ))}
    </svg>
  );
}

type Mood = "" | "terrible" | "bad" | "good" | "amazing";

const REACTIONS: Record<Mood, { eyes: MascotEyes; mouth: string }> = {
  "": { eyes: "open", mouth: "M27.5 50 Q32 52 36.5 48.5" },
  terrible: { eyes: "angry", mouth: "M27.5 52.5 Q32 47 36.5 52.5" },
  bad: { eyes: "flat", mouth: "M28 50.5 Q32 50.5 36 50.5" },
  good: { eyes: "open", mouth: "M27.5 49 Q32 54 36.5 49" },
  amazing: { eyes: "happy", mouth: "M27 48.5 Q32 57.5 37 48.5" },
};

export function ReactionMascot({ mood }: { mood: Mood }) {
  const { eyes, mouth } = REACTIONS[mood];
  return (
    <svg
      viewBox="12 0 40 64"
      aria-hidden="true"
      fill="none"
      className="h-13 w-8 overflow-visible text-foreground"
    >
      <MascotFigure
        eyes={eyes}
        mouth={mouth}
        mouthFilled={mood === "amazing"}
      />
    </svg>
  );
}
