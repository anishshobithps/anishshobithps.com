"use client";

import { useQueryStates, parseAsString, parseAsBoolean } from "nuqs";
import NextImage from "next/image";
import { toast } from "sonner";
import {
  deleteGuestbookEntry,
  togglePinEntry,
  type GuestbookEntryWithMeta,
} from "@/app/(site)/guestbook/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  TrashIcon,
  PushPinSimpleIcon,
  PushPinSimpleSlashIcon,
  HeartIcon,
  MagnifyingGlassIcon,
} from "@/components/shared/icons";
import { TypographySmall, TypographyMuted } from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useState } from "react";

const searchParsers = {
  q: parseAsString.withDefault(""),
  pinned: parseAsBoolean.withDefault(false),
};

export function GuestbookPanel({
  entries: initial,
}: {
  entries: GuestbookEntryWithMeta[];
}) {
  const [entries, setEntries] = useState(initial);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [{ q, pinned }, setParams] = useQueryStates(searchParsers, {
    shallow: true,
  });

  async function handleDelete(id: number) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await deleteGuestbookEntry(id);
      if (result.success) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success("Entry deleted.");
      } else {
        toast.error(result.error);
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handlePin(id: number, currentlyPinned: boolean) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
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
    } finally {
      setPendingId(null);
    }
  }

  if (entries.length === 0) {
    return (
      <TypographyMuted className="py-6 text-center">
        No guestbook entries yet.
      </TypographyMuted>
    );
  }

  const filtered = entries.filter((e) => {
    if (pinned && !e.isPinned) return false;
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      return (
        e.message.toLowerCase().includes(query) ||
        e.user.name.toLowerCase().includes(query) ||
        (e.user.username?.toLowerCase().includes(query) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search entries, names..."
            value={q}
            onChange={(e) => setParams({ q: e.target.value })}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button
          variant={pinned ? "secondary" : "outline"}
          size="sm"
          onClick={() => setParams({ pinned: !pinned })}
          className="shrink-0 gap-1.5 h-8 text-xs"
        >
          <PushPinSimpleIcon
            className="size-3"
            weight={pinned ? "fill" : "regular"}
          />
          Pinned only
        </Button>
      </div>

      {filtered.length === 0 ? (
        <TypographyMuted className="py-6 text-center">
          No entries match your filters.
        </TypographyMuted>
      ) : (
        <div className="flex flex-col divide-y divide-border border rounded-lg overflow-hidden">
          {filtered.map((entry) => (
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
                  unoptimized
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
                <TypographySmall
                  as="p"
                  className="font-normal leading-relaxed break-words"
                >
                  {entry.message}
                </TypographySmall>
                <TypographyMuted
                  as="span"
                  aria-label={`${entry.likeCount} like${entry.likeCount !== 1 ? "s" : ""}`}
                  className="flex items-center gap-1 text-xs mt-2"
                >
                  <HeartIcon
                    aria-hidden="true"
                    className="size-3"
                    weight="fill"
                  />
                  {entry.likeCount}
                </TypographyMuted>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={pendingId === entry.id}
                  onClick={() => handlePin(entry.id, entry.isPinned)}
                  aria-label={entry.isPinned ? "Unpin entry" : "Pin entry"}
                >
                  {entry.isPinned ? (
                    <PushPinSimpleSlashIcon className="size-4" />
                  ) : (
                    <PushPinSimpleIcon className="size-4" />
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={pendingId !== null}
                      aria-label={`Delete entry by ${entry.user.name}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This entry by{" "}
                        <span className="font-medium text-foreground">
                          {entry.user.name}
                        </span>{" "}
                        will be permanently removed and cannot be recovered.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        {pendingId === entry.id ? "Deleting…" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
