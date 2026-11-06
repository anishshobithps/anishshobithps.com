import type { GuestbookPreviewEntry } from "@/app/(site)/guestbook/actions";
import { formatShortDate } from "@repo/core/date";
import {
  TypographyMuted,
  TypographySmall,
} from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import Image from "next/image";
import type { CSSProperties } from "react";

function isClerkImageHost(url: string): boolean {
  try {
    return new URL(url).hostname === "img.clerk.com";
  } catch {
    return false;
  }
}

function EntryAvatar({ entry }: { entry: GuestbookPreviewEntry }) {
  const { name, imageUrl } = entry.user;
  if (imageUrl) {
    const src = isClerkImageHost(imageUrl) ? `${imageUrl}?width=56` : imageUrl;
    return (
      <Image
        src={src}
        alt=""
        className="size-7 shrink-0 rounded-full object-cover ring-1 ring-border"
        width={28}
        height={28}
        unoptimized
      />
    );
  }

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border select-none"
    >
      <TypographySmall>{initials || "?"}</TypographySmall>
    </div>
  );
}

function PreviewCard({
  entry,
  repeated,
}: {
  entry: GuestbookPreviewEntry;
  repeated: boolean;
}) {
  return (
    <li
      aria-hidden={repeated || undefined}
      className={cn(
        "w-56 shrink-0 snap-start items-start gap-2.5 rounded-md border border-border/60 bg-background px-3.5 py-3",
        repeated
          ? "hidden motion-safe:flex motion-safe:group-focus-visible/guestbook:hidden"
          : "flex",
      )}
    >
      <EntryAvatar entry={entry} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="truncate">
          <TypographySmall>{entry.user.name}</TypographySmall>
        </div>
        <time className="sr-only" dateTime={entry.createdAt}>
          {formatShortDate(entry.createdAt)}
        </time>
        <div className="line-clamp-2">
          <TypographyMuted as="span">{entry.message}</TypographyMuted>
        </div>
      </div>
    </li>
  );
}

export function GuestbookPreview({
  entries,
}: {
  entries: GuestbookPreviewEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-1 py-8">
        <TypographyMuted>Nobody here yet.</TypographyMuted>
        <TypographyMuted>Be the first to sign.</TypographyMuted>
      </div>
    );
  }

  const repeats = Math.ceil(5 / entries.length);
  const trackEntries = Array.from({ length: repeats }, () => entries).flat();

  return (
    <div
      role="region"
      aria-label="Guestbook entries"
      tabIndex={0}
      className="group/guestbook snap-x snap-proximity overflow-x-auto rounded-md pb-2 -outline-offset-2 scrollbar-none focus-visible:outline-2 focus-visible:outline-ring motion-safe:overflow-x-hidden motion-safe:focus-visible:overflow-x-auto"
    >
      <div
        className="flex w-max group-hover/guestbook:[animation-play-state:paused] motion-safe:animate-[guestbook-marquee_var(--guestbook-marquee-duration)_linear_infinite] motion-safe:group-focus-visible/guestbook:animate-none"
        style={
          {
            "--guestbook-marquee-duration": `${(trackEntries.length * 236) / 50}s`,
          } as CSSProperties
        }
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            role="list"
            aria-hidden={copy === 1 || undefined}
            className={cn(
              "shrink-0 gap-3 motion-safe:pr-3 motion-safe:group-focus-visible/guestbook:pr-0",
              copy === 0
                ? "flex"
                : "hidden motion-safe:flex motion-safe:group-focus-visible/guestbook:hidden",
            )}
          >
            {trackEntries.map((entry, index) => (
              <PreviewCard
                key={`${entry.id}-${index}`}
                entry={entry}
                repeated={index >= entries.length}
              />
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
