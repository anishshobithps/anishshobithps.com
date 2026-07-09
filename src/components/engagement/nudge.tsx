"use client";

import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

const POOLS = {
  mood: [
    "one click. no account. i timed it at ~0.8s.",
    "you have opinions. the buttons are right there.",
    "anonymous vibes are still vibes. tap one.",
    "the heart button is just a db row. very safe.",
    "you've read this far. you clearly have thoughts.",
    "no newsletter. no tracking pixel. just a vibe check.",
    "it's not a personality test. just pick one.",
    "i built this at 2am so you could click a button.",
  ],
  comment: [
    "i read every comment. slowly. with coffee.",
    "the textarea is lonely. genuinely.",
    "say something good. bad. unhinged. doesn't matter.",
    "nobody's watching except me. and i'm rooting for you.",
    "first comment is always the hardest. also the most legendary.",
    "this is basically my living room. so, hi.",
    "i built this comment section so people would use it. bold assumption.",
    "no pressure. but also, mild pressure.",
  ],
  guestbook: [
    "takes ~10 seconds. stays here forever. no pressure.",
    "everyone who signed in has a little corner of this page now.",
    "i'll read it. promise. eventually. with coffee.",
    "your message won't disappear. unlike my sleep schedule.",
    "hi. you stopped by. that means something.",
    "this page is basically a guestbook at a museum except the museum is me.",
    "no character limit anxiety. well. 280 chars. but still.",
  ],
} as const;

export type NudgeType = keyof typeof POOLS;

export function EngagementNudge({
  type,
  className,
}: {
  type: NudgeType;
  className?: string;
}) {
  const [line, setLine] = useState<string | null>(null);

  useEffect(() => {
    const pool = POOLS[type];
    setLine(pool[Math.floor(Math.random() * pool.length)]);
  }, [type]);

  if (!line) return null;

  return (
    <TypographyMuted
      className={cn(
        "text-center text-[10px] text-muted-foreground/40 font-mono",
        className,
      )}
      aria-hidden="true"
    >
      {`// ${line}`}
    </TypographyMuted>
  );
}
