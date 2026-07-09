"use client";

import { CaretDownIcon, ChatCircleIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

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
    <div className={cn("not-prose mt-10 mb-2", className)}>
      <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <TypographySmall className="text-foreground">
            That&apos;s the end. What did you think?
          </TypographySmall>
          <TypographyMuted className="text-[11px] text-muted-foreground/50 font-mono">
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
          <ChatCircleIcon size={13} aria-hidden="true" />
          Leave a comment
          <CaretDownIcon size={12} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function ScrollToEngagement({ count }: { count: number }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() =>
        document
          .getElementById("engagement")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="h-auto px-0 py-0 font-mono text-xs text-muted-foreground gap-1.5 hover:bg-transparent hover:text-foreground"
      aria-label={`${count} comment${count !== 1 ? "s" : ""} — scroll to discussion`}
    >
      <ChatCircleIcon size={14} className="shrink-0" aria-hidden="true" />
      {count} comment{count !== 1 ? "s" : ""}
    </Button>
  );
}
