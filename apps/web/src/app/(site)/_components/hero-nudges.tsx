import { IsoStage } from "@repo/iso/components/iso-stage";
import { isoCanvas, nudgeDraw } from "@repo/iso/components/classes";
import { cn } from "@repo/ui/lib/cn";
import { ArrowRightIcon } from "@repo/icons";
import { SectionLabel, TypographySmall } from "@repo/ui/components/typography";
import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

const VIEW_W = 120;
const VIEW_H = 80;

const WIPE =
  "-translate-x-full animate-nudge-wipe in-data-iso-active:animate-nudge-wipe-loop group-hover/nudge:animate-nudge-wipe-loop group-focus-visible/nudge:animate-nudge-wipe-loop motion-reduce:translate-x-0";

const UNWIPE =
  "translate-x-full animate-nudge-wipe in-data-iso-active:animate-nudge-unwipe-loop group-hover/nudge:animate-nudge-unwipe-loop group-focus-visible/nudge:animate-nudge-unwipe-loop motion-reduce:translate-x-0";

const POP_LOOP =
  "origin-center scale-0 animate-nudge-pop in-data-iso-active:animate-nudge-pop-loop group-hover/nudge:animate-nudge-pop-loop group-focus-visible/nudge:animate-nudge-pop-loop motion-reduce:scale-100";

const TYPE_LOOP =
  "origin-left scale-x-0 animate-nudge-type in-data-iso-active:animate-nudge-type-loop group-hover/nudge:animate-nudge-type-loop group-focus-visible/nudge:animate-nudge-type-loop motion-reduce:scale-x-100";

const RIBBON =
  "transition-[translate] duration-400 ease-snappy in-data-iso-active:translate-y-1 group-hover/nudge:translate-y-1 group-focus-visible/nudge:translate-y-1";

const PLACED = "absolute top-(--y) left-(--x) h-(--h) w-(--w)";

const across = (value: number) => `${(value / VIEW_W) * 100}%`;
const down = (value: number) => `${(value / VIEW_H) * 100}%`;

function GuestbookArt() {
  return (
    <>
      <svg viewBox="0 0 120 80" aria-hidden="true" className="size-full">
        <rect
          x="14"
          y="12"
          width="86"
          height="58"
          rx="4"
          transform="rotate(-4 57 41)"
          className="fill-background stroke-foreground/25"
        />
        <path
          d="M24 30 H62 M24 38 H50"
          strokeWidth="2"
          strokeLinecap="round"
          className="stroke-foreground/15"
        />
      </svg>
      <div
        aria-hidden="true"
        className={cn(PLACED, "overflow-hidden", WIPE)}
        style={
          {
            "--x": across(20),
            "--y": down(40),
            "--w": across(70),
            "--h": down(26),
            "--nudge-delay": "900ms",
          } as CSSProperties
        }
      >
        <svg viewBox="20 40 70 26" className={cn("absolute inset-0 size-full", UNWIPE)}>
          <path
            d="M22 58 C27 44, 33 64, 38 52 S47 42, 51 55 S62 63, 66 50 S78 45, 88 54"
            fill="none"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-(--brand)"
          />
        </svg>
      </div>
      <svg
        viewBox="80 21 16 14"
        aria-hidden="true"
        className={cn(PLACED, "overflow-visible", POP_LOOP)}
        style={
          {
            "--x": across(80),
            "--y": down(21),
            "--w": across(16),
            "--h": down(14),
            "--nudge-delay": "2000ms",
          } as CSSProperties
        }
      >
        <path
          d="M88 34 l-6.5 -6.2 a3.8 3.8 0 0 1 6.5 -4.8 a3.8 3.8 0 0 1 6.5 4.8 z"
          className="fill-(--brand)"
        />
      </svg>
    </>
  );
}

const LINES = [
  { y: 32, w: 44 },
  { y: 40, w: 38 },
  { y: 48, w: 44 },
  { y: 56, w: 24 },
];

function BlogArt() {
  return (
    <>
      <svg viewBox="0 0 120 80" aria-hidden="true" className="size-full">
        <rect
          x="30"
          y="10"
          width="62"
          height="64"
          rx="4"
          transform="rotate(6 61 42)"
          className="fill-muted stroke-foreground/15"
        />
        <path
          d="M26 8 H78 L90 20 V72 A4 4 0 0 1 86 76 H30 A4 4 0 0 1 26 72 Z"
          className="fill-background stroke-foreground/25"
        />
        <path d="M78 8 V20 H90" fill="none" className="stroke-foreground/25" />
        <rect
          x="34"
          y="18"
          width="30"
          height="6"
          rx="3"
          className="fill-(--brand)"
        />
        <rect
          x="61"
          y="54"
          width="1.6"
          height="7"
          className="animate-nudge-blink fill-(--brand)"
        />
        <path
          d="M70 8 V24 L74.5 20 L79 24 V8"
          className={cn(RIBBON, "fill-(--brand)/80")}
        />
      </svg>
      {LINES.map(({ y, w }, i) => (
        <span
          key={y}
          aria-hidden="true"
          className={cn(PLACED, TYPE_LOOP, "rounded-full bg-foreground/20")}
          style={
            {
              "--x": across(34),
              "--y": down(y),
              "--w": across(w),
              "--h": down(3),
              "--nudge-delay": `${900 + i * 220}ms`,
              "--i": i,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

interface NudgeProps {
  href: string;
  label: string;
  art: ReactNode;
  children: ReactNode;
}

function Nudge({ href, label, art, children }: NudgeProps) {
  return (
    <Link
      href={href as Route}
      prefetch={false}
      className="group/nudge flex items-center gap-3 rounded-md border bg-background/70 p-2 pr-4 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover"
    >
      <IsoStage className={cn(isoCanvas, "relative h-16 w-24 shrink-0 rounded-sm")}>
        {art}
      </IsoStage>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <SectionLabel pixel aria-hidden={undefined}>
          {label}
        </SectionLabel>
        <TypographySmall className="line-clamp-2 text-pretty leading-snug text-foreground">
          {children}
        </TypographySmall>
      </div>
      <ArrowRightIcon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-[translate,color] duration-300 group-hover/nudge:translate-x-1 group-hover/nudge:text-foreground"
      />
    </Link>
  );
}

interface HeroNudgesProps {
  latest?: { url: string; title: string };
}

export function HeroNudges({ latest }: HeroNudgesProps) {
  return (
    <nav
      aria-label="Places to go next"
      className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700 fill-mode-backwards [animation-delay:450ms]"
    >
      <div aria-hidden="true" className="hidden items-end gap-2 pl-2 lg:flex">
        <SectionLabel pixel className="text-(--brand-text)">
          psst, start here
        </SectionLabel>
        <svg viewBox="0 0 60 36" className="h-9 w-15 overflow-visible">
          <path
            d="M4 6 C22 0, 46 6, 50 28 M43 23 L50 30 L55 21"
            pathLength={1}
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(nudgeDraw, "stroke-(--brand)")}
            style={{ "--nudge-delay": "1400ms" } as CSSProperties}
          />
        </svg>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <Nudge href="/guestbook" label="Guestbook" art={<GuestbookArt />}>
          Leave a mark before you go
        </Nudge>
        {latest && (
          <Nudge href={latest.url} label="Latest post" art={<BlogArt />}>
            {latest.title}
          </Nudge>
        )}
      </div>
    </nav>
  );
}
