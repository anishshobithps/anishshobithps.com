"use client";

import { CaretDownIcon, ChatCircleIcon } from "@/components/shared/icons";
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
          <p className="text-sm font-medium text-foreground">
            That&apos;s the end. What did you think?
          </p>
          <p className="text-[11px] text-muted-foreground/50 font-mono">
            {commentCount > 0
              ? `// ${commentCount} ${commentCount === 1 ? "person has" : "people have"} already said something.`
              : "// no reactions yet. you could be the first."}
          </p>
        </div>
        <button
          onClick={scrollToEngagement}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/60 hover:border-border px-3 py-1.5 rounded-sm shrink-0 cursor-pointer"
          aria-label="Scroll to reactions and comments"
        >
          <ChatCircleIcon size={13} aria-hidden="true" />
          React or comment
          <CaretDownIcon size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
