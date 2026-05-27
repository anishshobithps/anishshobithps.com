"use client";

import { useState, useTransition } from "react";
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
import {
  TrashIcon,
  PushPinSimpleIcon,
  PushPinSimpleSlashIcon,
  HeartIcon,
  ArrowBendDownRightIcon,
} from "@/components/shared/icons";
import {
  TypographySmall,
  TypographyMuted,
  SectionHeader,
} from "@/components/ui/typography";
import { formatShortDate } from "@/lib/date";
import { cn } from "@/lib/cn";

export function CommentsPanel({
  comments: initial,
}: {
  comments: AdminCommentRow[];
}) {
  const [comments, setComments] = useState(initial);
  const [pending, startTransition] = useTransition();

  function handleDelete(id: number) {
    startTransition(async () => {
      const result = await deleteComment(id);
      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast.success("Comment deleted.");
      } else {
        toast.error(result.error);
      }
    });
  }

  function handlePin(id: number, currentlyPinned: boolean) {
    startTransition(async () => {
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
    });
  }

  if (comments.length === 0) {
    return (
      <TypographyMuted className="py-6 text-center">
        No blog comments yet.
      </TypographyMuted>
    );
  }

  const grouped = comments.reduce<Record<string, AdminCommentRow[]>>(
    (acc, c) => {
      (acc[c.postSlug] ??= []).push(c);
      return acc;
    },
    {},
  );
  const slugs = Object.keys(grouped).sort();

  return (
    <div className="flex flex-col gap-8">
      {slugs.map((slug) => (
        <div key={slug} className="flex flex-col gap-0">
          <div className="flex items-center justify-between mb-3">
            <SectionHeader className="text-sm mb-0">
              <Link
                href={slug}
                target="_blank"
                className="hover:underline underline-offset-2"
              >
                {slug}
              </Link>
            </SectionHeader>
            <TypographyMuted className="text-xs">
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
                )}
              >
                {comment.parentId !== null && (
                  <ArrowBendDownRightIcon className="size-3.5 mt-1 text-muted-foreground shrink-0" />
                )}
                {comment.user.imageUrl ? (
                  <NextImage
                    src={comment.user.imageUrl}
                    alt={comment.user.name}
                    width={28}
                    height={28}
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
                  <p className="text-sm leading-relaxed wrap-break-word">
                    {comment.body}
                  </p>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                    <HeartIcon className="size-3" weight="fill" />
                    {comment.likeCount}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    onClick={() => handlePin(comment.id, comment.isPinned)}
                    title={comment.isPinned ? "Unpin" : "Pin"}
                  >
                    {comment.isPinned ? (
                      <PushPinSimpleSlashIcon className="size-4" />
                    ) : (
                      <PushPinSimpleIcon className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={pending}
                    onClick={() => handleDelete(comment.id)}
                    title="Delete"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
