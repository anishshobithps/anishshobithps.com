"use client";

import {
  SectionLabel,
  TypographyLarge,
  TypographyMuted,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

const DESTINATIONS = [
  { href: "/guestbook", label: "Guestbook", note: "sign it!", accent: true },
  { href: "/blogs", label: "Blogs", note: "rants & fixes" },
  { href: "/projects", label: "Projects", note: "shipped chaos" },
  { href: "/resume", label: "Resume", note: "the serious one" },
];

const TILTS = [-4, 3, -2, 4];

interface PlankProps {
  index: number;
  accent?: boolean;
  children: ReactNode;
}

function plankClass({ index, accent }: Omit<PlankProps, "children">) {
  const right = index % 2 === 0;
  return cn(
    "plank absolute flex w-40 rotate-(--tilt) flex-col justify-center gap-0.5 py-2 transition-[rotate,translate,background-color] duration-300 ease-out hover:rotate-0 focus-visible:rotate-0",
    right
      ? "left-[calc(50%-6px)] origin-left pr-6 pl-5 [clip-path:polygon(0_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,0_100%)] hover:translate-x-1.5"
      : "right-[calc(50%-6px)] origin-right pr-5 pl-6 text-right [clip-path:polygon(14px_0,100%_0,100%_100%,14px_100%,0_50%)] hover:-translate-x-1.5",
    accent
      ? "plank-nudge bg-(--brand) text-neutral-950 hover:bg-(--brand)/90"
      : "bg-secondary text-foreground hover:bg-muted",
  );
}

function plankStyle(index: number) {
  return { top: `${28 + index * 46}px`, "--tilt": `${TILTS[index]}deg` } as CSSProperties;
}

function PlankText({ label, note }: { label: string; note: string }) {
  return (
    <>
      <SectionLabel pixel asChild className="text-inherit">
        <span>{label}</span>
      </SectionLabel>
      <span aria-hidden="true" className="text-[11px] leading-none opacity-70">
        {note}
      </span>
    </>
  );
}

function Signpost() {
  return (
    <svg
      viewBox="0 0 288 248"
      aria-hidden="true"
      className="absolute inset-0 size-full overflow-visible"
    >
      <ellipse cx="144" cy="226" rx="112" ry="9" className="fill-foreground/5" />
      <path
        d="M70 226 q3 -9 6 0 q3 -12 6 0 M196 225 q3 -8 6 0 q3 -11 6 0 q3 -7 6 0"
        fill="none"
        strokeWidth="1.4"
        strokeLinecap="round"
        className="stroke-(--brand)/60"
      />
      <path d="M131 14 L144 4 L157 14 Z" className="fill-muted-foreground/60" />
      <rect x="138" y="14" width="12" height="214" rx="2" className="fill-muted stroke-foreground/20" />
      <path d="M142 30 V210 M146 60 V190" strokeWidth="0.8" className="stroke-foreground/10" />
      <g className="pin-bounce">
        <path
          d="M232 222 c-6 -7 -9 -11 -9 -15 a9 9 0 0 1 18 0 c0 4 -3 8 -9 15 z"
          className="fill-(--brand)"
        />
        <circle cx="232" cy="207" r="3" className="fill-background" />
      </g>
      <text x="232" y="242" fontSize="8" textAnchor="middle" className="iso-label">
        you are here
      </text>
    </svg>
  );
}

function backToTop() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  document.getElementById("main-content")?.focus({ preventScroll: true });
}

export function EndOfPage() {
  const pathname = usePathname();
  const planks = DESTINATIONS.filter((d) => !pathname.startsWith(d.href)).slice(0, 3);

  return (
    <div className="grid items-center gap-8 sm:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="flex flex-col gap-3">
        <SectionLabel pixel className="text-(--brand-text)">
          End of the page
        </SectionLabel>
        <TypographyLarge>Aaah, you hit the bottom.</TypographyLarge>
        <TypographyMuted className="max-w-sm text-pretty leading-relaxed">
          Scrolled all the way down and still curious? Good. There&apos;s more
          lying around. Pick a sign and wander off.
        </TypographyMuted>
      </div>

      <nav aria-label="Keep exploring" className="relative mx-auto h-62 w-full max-w-72">
        <Signpost />
        {planks.map(({ href, label, note, accent }, index) => (
          <Link
            key={href}
            href={href as Route}
            aria-label={`${label}, ${note}`}
            className={plankClass({ index, accent })}
            style={plankStyle(index)}
          >
            <PlankText label={label} note={note} />
          </Link>
        ))}
        <button
          type="button"
          onClick={backToTop}
          aria-label="Back to top"
          className={plankClass({ index: planks.length })}
          style={plankStyle(planks.length)}
        >
          <PlankText label="Back to top" note="one more lap?" />
        </button>
      </nav>
    </div>
  );
}
