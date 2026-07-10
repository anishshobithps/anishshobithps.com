"use client";

import type { GuestbookEntryWithMeta } from "@/app/(site)/guestbook/actions";
import { Avatar } from "@/components/engagement/avatar";
import {
  HeartIcon,
  PushPinSimpleIcon,
  TrashIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  Text,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/date";
import { memo, useEffect, useRef, useState } from "react";

export const GuestbookEntry = memo(function GuestbookEntry({
  entry,
  currentUserId,
  onLike,
  onDelete,
  likePendingRef,
}: {
  entry: GuestbookEntryWithMeta;
  currentUserId: string | null;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  likePendingRef: React.RefObject<Set<number>>;
}) {
  const canDelete = currentUserId === entry.user.id;
  const isOptimistic = entry.id < 0;
  const isLikePending = likePendingRef.current?.has(entry.id) ?? false;

  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const msgRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = msgRef.current;
    if (!el) return;

    const checkClamp = () => setIsClamped(el.scrollHeight > el.clientHeight + 1);
    requestAnimationFrame(checkClamp);

    const ro = new ResizeObserver(checkClamp);
    ro.observe(el);
    return () => ro.disconnect();
  }, [entry.message]);

  return (
    <li
      className={cn(
        "relative px-3 py-3 sm:px-5 sm:py-4",
        "transition-colors duration-150 hover:bg-muted/30",
        entry.isPinned && "bg-primary/3",
      )}
    >
      {entry.isPinned && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px bg-primary/60"
        />
      )}

      <div className="flex gap-2.5 sm:gap-3">
        <Avatar imageUrl={entry.user.imageUrl} name={entry.user.name} />

        <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <TypographySmall className="font-semibold leading-none">
              {entry.user.name}
            </TypographySmall>
            <TypographyMuted className="text-xs tabular-nums">
              <time dateTime={entry.createdAt} suppressHydrationWarning>
                {timeAgo(entry.createdAt)}
              </time>
            </TypographyMuted>
            {entry.isPinned && (
              <PushPinSimpleIcon size={14} weight="fill" aria-label="Pinned" />
            )}
          </div>

          <Text
            as="p"
            ref={msgRef}
            variant="none"
            className={cn(
              "text-[13px] sm:text-sm leading-relaxed wrap-anywhere",
              !expanded && "line-clamp-3",
            )}
          >
            {entry.message}
          </Text>

          {(isClamped || expanded) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="h-auto px-0 py-0 text-xs font-medium text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              {expanded ? "Show less" : "Read more"}
            </Button>
          )}

          <div className="pt-0.5">
            <ButtonGroup>
              <Button
                variant={entry.likedByMe ? "default" : "outline"}
                size="sm"
                onClick={() => !isOptimistic && onLike(entry.id)}
                disabled={isOptimistic || isLikePending}
                aria-pressed={entry.likedByMe}
                aria-label={
                  entry.likedByMe
                    ? `Unlike (${entry.likeCount})`
                    : `Like (${entry.likeCount})`
                }
                className="gap-1.5"
              >
                <HeartIcon
                  size={14}
                  weight={entry.likedByMe ? "fill" : "duotone"}
                  aria-hidden="true"
                />
                {entry.likeCount > 0 ? (
                  <span className="tabular-nums">{entry.likeCount}</span>
                ) : (
                  <span className="hidden sm:inline">Like</span>
                )}
              </Button>

              {canDelete && !isOptimistic && (
                <>
                  <ButtonGroupSeparator />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    aria-label="Delete message"
                    className="gap-1.5 text-destructive border-destructive/20 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                  >
                    <TrashIcon
                      size={14}
                      className="text-destructive"
                      aria-hidden="true"
                    />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </>
              )}
            </ButtonGroup>
          </div>
        </div>
      </div>
    </li>
  );
});
