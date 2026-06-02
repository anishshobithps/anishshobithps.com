"use client";

import { useQueryStates, parseAsString, parseAsBoolean } from "nuqs";
import NextImage from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  deleteComment,
  togglePinComment,
} from "@/app/(site)/blog/[[...slug]]/actions";
import type { AdminCommentRow } from "@/app/admin/actions";
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
  ArrowBendDownRightIcon,
  MagnifyingGlassIcon,
} from "@/components/shared/icons";
import {
  TypographySmall,
  TypographyMuted,
  SectionHeader,
} from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/cn";
import { useState } from "react";

const searchParsers = {
  q: parseAsString.withDefault(""),
  pinned: parseAsBoolean.withDefault(false),
};

function slugToTitle(slug: string): string {
  const segment = slug.replace(/^\/blog\//, "").replace(/\//g, " / ");
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CommentsPanel({
  comments: initial,
}: {
  comments: AdminCommentRow[];
}) {
  const [comments, setComments] = useState(initial);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [{ q, pinned }, setParams] = useQueryStates(searchParsers, {
    shallow: true,
  });

  async function handleDelete(id: number) {
    if (pendingId !== null) return;
    setPendingId(id);
    try {
      const result = await deleteComment(id);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("Comment deleted.");
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
      const result = await togglePinComment(id);
      if (result.success) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, isPinned: !currentlyPinned } : c,
          ),
        );
        toast.success(
          currentlyPinned ? "Comment unpinned." : "Comment pinned.",
        );
      } else {
        toast.error(result.error);
      }
    } finally {
      setPendingId(null);
    }
  }

  if (comments.length === 0) {
    return (
      <TypographyMuted className="py-6 text-center">
        No blog comments yet.
      </TypographyMuted>
    );
  }

  const filtered = comments.filter((c) => {
    if (pinned && !c.isPinned) return false;
    if (q.trim()) {
      const query = q.trim().toLowerCase();
      return (
        c.body.toLowerCase().includes(query) ||
        c.user.name.toLowerCase().includes(query) ||
        (c.user.username?.toLowerCase().includes(query) ?? false)
      );
    }
    return true;
  });

  const grouped = filtered.reduce<Record<string, AdminCommentRow[]>>(
    (acc, c) => {
      (acc[c.postSlug] ??= []).push(c);
      return acc;
    },
    {},
  );
  const slugs = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search comments, names..."
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

      {slugs.length === 0 && (
        <TypographyMuted className="py-6 text-center">
          No comments match your filters.
        </TypographyMuted>
      )}

      <div className="flex flex-col gap-8">
        {slugs.map((slug) => (
          <div key={slug} className="flex flex-col gap-0">
            <div className="flex items-center justify-between mb-3">
              <SectionHeader className="text-sm mb-0 min-w-0 mr-3">
                <Link
                  href={slug}
                  target="_blank"
                  className="hover:underline underline-offset-2 truncate block"
                  title={slug}
                >
                  {slugToTitle(slug)}
                </Link>
              </SectionHeader>
              <TypographyMuted className="text-xs shrink-0">
                {grouped[slug].length} comment
                {grouped[slug].length !== 1 ? "s" : ""}
              </TypographyMuted>
            </div>

            <div className="flex flex-col divide-y divide-border border rounded-lg overflow-hidden">
              {grouped[slug].map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "flex items-start gap-3 p-3",
                    comment.isPinned && "bg-accent/30",
                    comment.parentId !== null && "pl-9",
                  )}
                >
                  {comment.parentId !== null && (
                    <ArrowBendDownRightIcon
                      aria-hidden="true"
                      className="size-3.5 mt-1 text-muted-foreground shrink-0 -ml-6"
                    />
                  )}
                  {comment.user.imageUrl ? (
                    <NextImage
                      src={comment.user.imageUrl}
                      alt={comment.user.name}
                      width={28}
                      height={28}
                      unoptimized
                      className="size-7 rounded-full shrink-0 object-cover"
                    />
                  ) : (
                    <div className="size-7 rounded-full shrink-0 bg-muted" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <TypographySmall className="font-medium">
                        {comment.user.name}
                      </TypographySmall>
                      {comment.user.username && (
                        <TypographyMuted className="text-xs">
                          @{comment.user.username}
                        </TypographyMuted>
                      )}
                      {comment.isPinned && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <PushPinSimpleIcon className="size-3" weight="fill" />
                          Pinned
                        </Badge>
                      )}
                      {comment.parentId !== null && (
                        <Badge variant="outline" className="text-xs">
                          Reply
                        </Badge>
                      )}
                      <TypographyMuted className="text-xs ml-auto">
                        {formatShortDate(comment.createdAt)}
                      </TypographyMuted>
                    </div>
                    <TypographySmall
                      as="p"
                      className="font-normal leading-relaxed break-words"
                    >
                      {comment.body}
                    </TypographySmall>
                    <TypographyMuted
                      as="span"
                      aria-label={`${comment.likeCount} like${comment.likeCount !== 1 ? "s" : ""}`}
                      className="flex items-center gap-1 text-xs mt-1.5"
                    >
                      <HeartIcon
                        aria-hidden="true"
                        className="size-3"
                        weight="fill"
                      />
                      {comment.likeCount}
                    </TypographyMuted>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={pendingId === comment.id}
                        onClick={() => handlePin(comment.id, comment.isPinned)}
                        aria-label={
                          comment.isPinned ? "Unpin comment" : "Pin comment"
                        }
                      >
                        {comment.isPinned ? (
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
                            aria-label={`Delete comment by ${comment.user.name}`}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <TrashIcon className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This comment by{" "}
                              <span className="font-medium text-foreground">
                                {comment.user.name}
                              </span>{" "}
                              will be permanently removed and cannot be
                              recovered.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(comment.id)}
                            >
                              {pendingId === comment.id
                                ? "Deleting…"
                                : "Delete"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
