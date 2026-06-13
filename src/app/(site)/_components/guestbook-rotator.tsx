"use client";

import { useState } from "react";
import type { GuestbookPreviewEntry } from "@/app/(site)/guestbook/actions";
import { TypographyMuted } from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";

function EntryAvatar({ entry }: { entry: GuestbookPreviewEntry }) {
  const initials = entry.user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (entry.user.imageUrl) {
    const src = entry.user.imageUrl.includes("img.clerk.com")
      ? `${entry.user.imageUrl}?width=56`
      : entry.user.imageUrl;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={entry.user.name}
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
  const [paused, setPaused] = useState(false);

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

  // Duplicate enough copies for a seamless loop (min 2 full sets)
  const copies = entries.length < 5 ? 4 : 2;
  const track = Array.from({ length: copies }, () => entries).flat();
  // Duration scales with entry count so speed stays consistent (~50px/s at w-56=224px)
  const duration = `${Math.round((entries.length * 224) / 50)}s`;

  return (
    <div className="mb-8 -mx-6 sm:-mx-8 lg:-mx-10">
      {/* Marquee — hidden when motion is reduced */}
      <div
        className="overflow-hidden motion-reduce:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex gap-3 w-max px-3"
          style={{
            animation: `marquee ${duration} linear infinite`,
            animationPlayState: paused ? "paused" : "running",
          }}
          aria-hidden="true"
        >
          {track.map((entry, i) => (
            <EntryCard key={i} entry={entry} />
          ))}
        </div>
      </div>

      {/* Static fallback for prefers-reduced-motion */}
      <ul
        className="hidden motion-reduce:flex flex-col gap-4 px-6 sm:px-8 lg:px-10 mb-2"
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

      {/* Always-accessible sr-only version */}
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
