"use client";

import { useState } from "react";
import type { GuestbookPreviewEntry } from "@/app/(site)/guestbook/actions";
import { PauseIcon, PlayIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";

function isClerkImageHost(url: string): boolean {
  try {
    return new URL(url).hostname === "img.clerk.com";
  } catch {
    return false;
  }
}

function EntryAvatar({ entry }: { entry: GuestbookPreviewEntry }) {
  const initials = entry.user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (entry.user.imageUrl) {
    const src = isClerkImageHost(entry.user.imageUrl)
      ? `${entry.user.imageUrl}?width=56`
      : entry.user.imageUrl;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="size-7 rounded-full ring-1 ring-border shrink-0 object-cover"
        width={28}
        height={28}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div className="size-7 rounded-full bg-muted ring-1 ring-border flex items-center justify-center text-[9px] font-semibold text-muted-foreground shrink-0 select-none">
      {initials || "?"}
    </div>
  );
}

function EntryCard({ entry }: { entry: GuestbookPreviewEntry }) {
  return (
    <div className="flex items-start gap-2.5 border border-border/60 rounded-md px-3.5 py-3 w-56 shrink-0 bg-background">
      <EntryAvatar entry={entry} />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold leading-none truncate mb-1">
          {entry.user.name}
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {entry.message}
        </div>
      </div>
    </div>
  );
}

export function GuestbookRotator({
  entries,
}: {
  entries: GuestbookPreviewEntry[];
}) {
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);

  if (entries.length === 0) {
    return (
      <div className="py-8 space-y-1 mb-8">
        <TypographyMuted>Nobody here yet.</TypographyMuted>
        <TypographyMuted className="font-mono text-xs">
          {"// be the first."}
        </TypographyMuted>
      </div>
    );
  }

  const copies = entries.length < 5 ? 4 : 2;
  const track = Array.from({ length: copies }, () => entries).flat();
  const duration = `${Math.round((entries.length * 224) / 50)}s`;

  return (
    <div className="mb-8 -mx-gutter">
      <div className="motion-reduce:hidden">
        <div
          className="overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className="flex gap-3 w-max px-3"
            style={{
              animation: `marquee ${duration} linear infinite`,
              animationPlayState: hovered || stopped ? "paused" : "running",
            }}
            aria-hidden="true"
          >
            {track.map((entry, i) => (
              <EntryCard key={i} entry={entry} />
            ))}
          </div>
        </div>

        <div className="flex justify-end px-gutter pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setStopped((prev) => !prev)}
            aria-label={
              stopped
                ? "Resume scrolling guestbook entries"
                : "Pause scrolling guestbook entries"
            }
            className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
          >
            {stopped ? (
              <PlayIcon data-icon="inline-start" size={12} aria-hidden="true" />
            ) : (
              <PauseIcon data-icon="inline-start" size={12} aria-hidden="true" />
            )}
            <span className="text-xs">{stopped ? "Resume" : "Pause"}</span>
          </Button>
        </div>
      </div>

      <ul
        className="hidden motion-reduce:flex flex-col gap-4 px-gutter mb-2"
        aria-label="Guestbook entries"
      >
        {entries.slice(0, 4).map((entry) => (
          <li key={entry.id} className="flex gap-3">
            <EntryAvatar entry={entry} />
            <div className="min-w-0 space-y-0.5">
              <div className="text-sm font-semibold leading-none">
                {entry.user.name}
              </div>
              <TypographyMuted className="text-sm leading-relaxed line-clamp-2">
                {entry.message}
              </TypographyMuted>
            </div>
          </li>
        ))}
      </ul>

      <ul className="sr-only motion-reduce:hidden">
        {entries.map((e) => (
          <li key={e.id}>
            {e.user.name}, {formatShortDate(e.createdAt)}: {e.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
