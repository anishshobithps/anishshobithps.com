"use client";

import { ChatCircleIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

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
