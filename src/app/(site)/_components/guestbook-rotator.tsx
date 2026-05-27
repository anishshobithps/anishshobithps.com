"use client";

import { useState, useEffect, useCallback } from "react";
import type { GuestbookPreviewEntry } from "@/app/(site)/guestbook/actions";
import { TypographyMuted } from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/cn";

const DISPLAY_COUNT = 3;
const ROTATION_INTERVAL = 4000;
const FADE_DURATION = 350;

function EntryAvatar({ entry }: { entry: GuestbookPreviewEntry }) {
  const initials = entry.user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (entry.user.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={entry.user.imageUrl}
        alt={entry.user.name}
        className="size-8 rounded-full ring-1 ring-border shrink-0 object-cover"
        width={32}
        height={32}
      />
    );
  }

  return (
    <div className="size-8 rounded-full bg-muted ring-1 ring-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground shrink-0 select-none">
      {initials || "?"}
    </div>
  );
}

export function GuestbookRotator({
  entries,
}: {
  entries: GuestbookPreviewEntry[];
}) {
  const count = Math.min(DISPLAY_COUNT, entries.length);
  const [displayed, setDisplayed] = useState<GuestbookPreviewEntry[]>(
    entries.slice(0, count),
  );
  const [fadingIndex, setFadingIndex] = useState<number | null>(null);

  const rotate = useCallback(() => {
    if (entries.length <= count) return;

    const slotIndex = Math.floor(Math.random() * count);
    setFadingIndex(slotIndex);

    setTimeout(() => {
      setDisplayed((prev) => {
        const displayedIds = new Set(prev.map((e) => e.id));
        const available = entries.filter((e) => !displayedIds.has(e.id));
        if (available.length === 0) return prev;
        const next = available[Math.floor(Math.random() * available.length)];
        const updated = [...prev];
        updated[slotIndex] = next;
        return updated;
      });
      setFadingIndex(null);
    }, FADE_DURATION);
  }, [entries, count]);

  useEffect(() => {
    if (entries.length <= count) return;
    const id = setInterval(rotate, ROTATION_INTERVAL);
    return () => clearInterval(id);
  }, [rotate, entries.length, count]);

  if (entries.length === 0) {
    return (
      <div className="py-8 space-y-1 mb-8">
        <TypographyMuted>Nobody here yet.</TypographyMuted>
        <TypographyMuted className="font-mono text-xs text-muted-foreground/40">
          {"// be the first."}
        </TypographyMuted>
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-5">
      {displayed.map((entry, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-3 transition-opacity ease-in-out",
            fadingIndex === i ? "opacity-0" : "opacity-100",
          )}
          style={{ transitionDuration: `${FADE_DURATION}ms` }}
        >
          <EntryAvatar entry={entry} />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold leading-none">
                {entry.user.name}
              </span>
              <TypographyMuted className="font-mono text-xs">
                {formatShortDate(entry.createdAt)}
              </TypographyMuted>
            </div>
            <TypographyMuted className="text-sm leading-relaxed line-clamp-2">
              {entry.message}
            </TypographyMuted>
          </div>
        </div>
      ))}
    </div>
  );
}
