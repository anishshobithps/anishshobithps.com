"use client";

import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const GUESTBOOK_NUDGES = [
  "takes ~10 seconds. stays here forever. no pressure.",
  "everyone who signed in has a little corner of this page now.",
  "i'll read it. promise. eventually. with coffee.",
  "your message won't disappear. unlike my sleep schedule.",
  "hi. you stopped by. that means something.",
  "this page is basically a guestbook at a museum except the museum is me.",
  "no character limit anxiety. well. 280 chars. but still.",
] as const;

export function GuestbookNudge({ className }: { className?: string }) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    setLine(
      GUESTBOOK_NUDGES[Math.floor(Math.random() * GUESTBOOK_NUDGES.length)],
    );
  }, []);

  if (!line) return null;

  return (
    <p
      className={cn(
        "text-center text-[10px] text-muted-foreground/40 font-mono",
        className,
      )}
      aria-hidden="true"
    >
      {`// ${line}`}
    </p>
  );
}
