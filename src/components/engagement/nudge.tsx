"use client";

import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useSyncExternalStore } from "react";

const POOLS = {
  comment: [
    "i read every comment. slowly. with ice cream.",
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
    "i'll read it. promise. eventually. with ice cream.",
    "your message won't disappear. unlike my sleep schedule.",
    "hi. you stopped by. that means something.",
    "this page is basically a guestbook at a museum except the museum is me.",
    "no character limit anxiety. well. 280 chars. but still.",
  ],
} as const;

export type NudgeType = keyof typeof POOLS;

const picked = new Map<NudgeType, string>();

function pickLine(type: NudgeType): string {
  const cached = picked.get(type);
  if (cached) return cached;
  const pool = POOLS[type];
  const line = pool[Math.floor(Math.random() * pool.length)]!;
  picked.set(type, line);
  return line;
}

function subscribeToNothing() {
  return () => {};
}

export function EngagementNudge({
  type,
  className,
}: {
  type: NudgeType;
  className?: string;
}) {
  const line = useSyncExternalStore(
    subscribeToNothing,
    () => pickLine(type),
    () => null,
  );

  if (!line) return null;

  return (
    <TypographyMuted
      className={cn("text-center text-xs font-mono", className)}
      aria-hidden="true"
    >
      {`// ${line}`}
    </TypographyMuted>
  );
}
