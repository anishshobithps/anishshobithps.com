"use client";

import { CaretDownIcon, ChatCircleIcon } from "@/components/shared/icons";
import { LogoMascot } from "@/components/shared/logo-mascot";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { gitDraw, gitPop } from "@/components/diagrams/classes";
import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";

function delay(ms: number) {
  return { "--git-delay": `${ms}ms` } as CSSProperties;
}

function FinishLine() {
  return (
    <div aria-hidden="true" className="relative h-3">
      <svg
        viewBox="0 0 400 12"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <path
          d="M2 7 C60 4, 120 9.5, 200 6.5 S330 4.5, 398 7"
          pathLength={1}
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={cn(gitDraw, "stroke-border")}
          style={delay(100)}
        />
      </svg>
      <div
        className={cn(
          gitPop,
          "absolute right-1 bottom-1.5 flex origin-bottom items-end gap-0.5",
        )}
        style={delay(900)}
      >
        <svg viewBox="0 0 16 30" className="h-7.5 w-4 overflow-visible">
          <g className="[transform-box:fill-box] origin-bottom-left animate-flag-wave">
            <path
              d="M3 29 V3"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="stroke-muted-foreground"
            />
            <path d="M3 3.5 L14 7 L3 10.5 Z" className="fill-(--brand)" />
          </g>
        </svg>
        <LogoMascot size={36} eyes="happy" waving className="text-foreground" />
      </div>
    </div>
  );
}

interface EndOfPostProps {
  commentCount: number;
  className?: string;
}

export function EndOfPost({ commentCount, className }: EndOfPostProps) {
  const scrollToEngagement = () => {
    document
      .getElementById("engagement")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Reveal className={cn("not-prose mt-14 mb-2", className)}>
      <FinishLine />
      <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <TypographySmall className="text-foreground">
            That&apos;s the end. What did you think?
          </TypographySmall>
          <TypographyMuted className="text-xs font-mono">
            {commentCount > 0
              ? `// ${commentCount} ${commentCount === 1 ? "person has" : "people have"} already said something.`
              : "// no reactions yet. you could be the first."}
          </TypographyMuted>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollToEngagement}
          className="gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-sm shrink-0"
          aria-label="Scroll to reactions and comments"
        >
          <ChatCircleIcon
            data-icon="inline-start"
            size={13}
            aria-hidden="true"
          />
          Leave a comment
          <CaretDownIcon data-icon="inline-end" size={12} aria-hidden="true" />
        </Button>
      </div>
    </Reveal>
  );
}

export function ScrollToEngagement({ count }: { count: number }) {
  return (
    <Button
      variant="link"
      size="sm"
      onClick={() =>
        document
          .getElementById("engagement")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="h-auto px-0 py-0 font-mono text-xs text-muted-foreground gap-1.5 hover:bg-transparent hover:text-foreground"
      aria-label={`${count} comment${count !== 1 ? "s" : ""}, scroll to discussion`}
    >
      <ChatCircleIcon
        data-icon="inline-start"
        size={14}
        className="shrink-0"
        aria-hidden="true"
      />
      {count} comment{count !== 1 ? "s" : ""}
    </Button>
  );
}
