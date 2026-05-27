"use client";

import { useState, useTransition } from "react";
import NextImage from "next/image";
import { toast } from "sonner";
import {
  deleteGuestbookEntry,
  togglePinEntry,
  type GuestbookEntryWithMeta,
} from "@/app/(site)/guestbook/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrashIcon,
  PushPinSimpleIcon,
  PushPinSimpleSlashIcon,
  HeartIcon,
} from "@/components/shared/icons";
import { TypographySmall, TypographyMuted } from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/cn";

export function GuestbookPanel({
  entries: initial,
}: {
  entries: GuestbookEntryWithMeta[];
}) {
  const [entries, setEntries] = useState(initial);
  const [pending, startTransition] = useTransition();

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteGuestbookEntry(id);
      if (result.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success("Entry deleted.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handlePin(id: number, currentlyPinned: boolean) {
    startTransition(async () => {
      const result = await togglePinEntry(id);
      if (result.success) {
        setEntries((prev) =>
          prev.map((e) =>
            e.id === id ? { ...e, isPinned: !currentlyPinned } : e,
          ),
        );
        toast.success(currentlyPinned ? "Entry unpinned." : "Entry pinned.");
      } else {
        toast.error(result.error);
      }
    });
  }

  if (entries.length === 0) {
    return (
      <TypographyMuted className="py-6 text-center">
        No guestbook entries yet.
      </TypographyMuted>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-border border rounded-lg overflow-hidden">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className={cn(
            "flex items-start gap-3 p-4",
            entry.isPinned && "bg-accent/30",
          )}
        >
          {entry.user.imageUrl ? (
            <NextImage
              src={entry.user.imageUrl}
              alt={entry.user.name}
              width={32}
              height={32}
              className="size-8 rounded-full shrink-0 object-cover"
            />
          ) : (
            <div className="size-8 rounded-full shrink-0 bg-muted" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <TypographySmall className="font-medium">
                {entry.user.name}
              </TypographySmall>
              {entry.user.username && (
                <TypographyMuted className="text-xs">
                  @{entry.user.username}
                </TypographyMuted>
              )}
              {entry.isPinned && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <PushPinSimpleIcon className="size-3" weight="fill" />
                  Pinned
                </Badge>
              )}
              <TypographyMuted className="text-xs ml-auto">
                {formatShortDate(entry.createdAt)}
              </TypographyMuted>
            </div>
            <p className="text-sm leading-relaxed wrap-break-word">
              {entry.message}
            </p>
            <span className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <HeartIcon className="size-3" weight="fill" />
              {entry.likeCount}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => handlePin(entry.id, entry.isPinned)}
              title={entry.isPinned ? "Unpin" : "Pin"}
            >
              {entry.isPinned ? (
                <PushPinSimpleSlashIcon className="size-4" />
              ) : (
                <PushPinSimpleIcon className="size-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              onClick={() => handleDelete(entry.id)}
              title="Delete"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
