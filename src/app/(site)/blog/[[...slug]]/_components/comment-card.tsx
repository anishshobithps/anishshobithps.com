"use client";

import type { CommentWithMeta } from "@/app/(site)/blog/[[...slug]]/actions";
import { Avatar } from "@/components/engagement/avatar";
import { Composer } from "@/components/engagement/composer";
import {
  ArrowBendDownRightIcon,
  HeartIcon,
  PushPinSimpleIcon,
  TrashIcon,
} from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/date";
import { SignInButton } from "@clerk/nextjs";
import { useEffect, useRef, useState, useTransition } from "react";

const COMMENT_MAX_LENGTH = 1000;
const MAX_DEPTH = 2;

function LikeButton({
  count,
  liked,
  pending,
  onToggle,
}: {
  count: number;
  liked: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      onClick={onToggle}
      disabled={pending}
      aria-pressed={liked}
      aria-busy={pending}
      aria-label={liked ? `Unlike (${count})` : `Like (${count})`}
      className="gap-1.5"
    >
      {pending ? (
        <Spinner
          data-icon="inline-start"
          className="size-3.5"
          aria-hidden="true"
        />
      ) : (
        <HeartIcon
          data-icon="inline-start"
          size={14}
          weight={liked ? "fill" : "duotone"}
          aria-hidden="true"
        />
      )}
      {count > 0 ? (
        <span className="tabular-nums">{count}</span>
      ) : (
        <span className="hidden sm:inline">Like</span>
      )}
    </Button>
  );
}

export function CommentCard({
  comment,
  currentUserId,
  depth,
  isSignedIn,
  onLike,
  onDelete,
  onReply,
  pendingLikes,
  ...liProps
}: {
  comment: CommentWithMeta;
  currentUserId: string | null;
  depth: number;
  isSignedIn: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (parentId: number, body: string) => Promise<boolean>;
  pendingLikes: ReadonlySet<number>;
} & React.ComponentProps<"li">) {
  const [replying, setReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  const replyRef = useRef<HTMLDivElement>(null);

  const isOptimistic = comment.id < 0;
  const isLikePending = pendingLikes.has(comment.id);
  const canDelete = currentUserId === comment.user.id;
  const isPinnedRoot = comment.isPinned && depth === 0;

  useEffect(() => {
    if (replying && replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [replying]);

  return (
    <li
      {...liProps}
      className={cn(
        "relative",
        isPinnedRoot && "bg-primary/3",
        isOptimistic && "opacity-70",
        liProps.className,
      )}
      aria-busy={isOptimistic || undefined}
    >
      {isPinnedRoot && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px bg-primary/50"
        />
      )}

      <div className="px-3 py-3 sm:px-5 sm:py-4 transition-colors duration-150 hover:bg-muted/30">
        <div className="flex gap-2.5 sm:gap-3">
          <Avatar imageUrl={comment.user.imageUrl} name={comment.user.name} />

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <TypographySmall className="font-semibold leading-none">
                {comment.user.name}
              </TypographySmall>
              {comment.user.username && (
                <TypographyMuted className="text-xs leading-none">
                  @{comment.user.username}
                </TypographyMuted>
              )}
              {isOptimistic ? (
                <TypographyMuted
                  className="flex items-center gap-1 text-xs"
                  aria-live="polite"
                >
                  <Spinner className="size-2.5" aria-hidden="true" />
                  Sending…
                </TypographyMuted>
              ) : (
                <TypographyMuted className="text-xs tabular-nums">
                  <time dateTime={comment.createdAt} suppressHydrationWarning>
                    {timeAgo(comment.createdAt)}
                  </time>
                </TypographyMuted>
              )}
              {isPinnedRoot && (
                <Badge
                  variant="secondary"
                  className="gap-1 h-4 px-1.5 text-[10px] py-0 font-medium"
                >
                  <PushPinSimpleIcon size={9} aria-hidden="true" />
                  Pinned
                </Badge>
              )}
            </div>

            <Text
              as="p"
              variant="none"
              className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap wrap-break-word"
            >
              {comment.body}
            </Text>

            <div className="pt-0.5">
              <ButtonGroup>
                <LikeButton
                  count={comment.likeCount}
                  liked={comment.likedByMe}
                  pending={isOptimistic || isLikePending}
                  onToggle={() => onLike(comment.id)}
                />

                {depth < MAX_DEPTH && !isOptimistic && (
                  <>
                    <ButtonGroupSeparator />
                    {isSignedIn ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplying((v) => !v)}
                        disabled={isPending}
                        aria-expanded={replying}
                        aria-busy={isPending}
                        aria-label="Reply to comment"
                        className="gap-1.5"
                      >
                        <ArrowBendDownRightIcon
                          data-icon="inline-start"
                          size={14}
                          aria-hidden="true"
                        />
                        Reply
                        {comment.replies.length > 0 && !replying && (
                          <span className="tabular-nums opacity-60">
                            {comment.replies.length}
                          </span>
                        )}
                      </Button>
                    ) : (
                      <SignInButton mode="modal">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ArrowBendDownRightIcon
                            data-icon="inline-start"
                            size={14}
                            aria-hidden="true"
                          />
                          Reply
                          <span className="text-[10px] opacity-50">
                            (sign in)
                          </span>
                        </Button>
                      </SignInButton>
                    )}
                  </>
                )}

                {canDelete && !isOptimistic && (
                  <>
                    <ButtonGroupSeparator />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(comment.id)}
                      aria-label="Delete comment"
                      className="gap-1.5 text-destructive border-destructive/20 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
                    >
                      <TrashIcon
                        data-icon="inline-start"
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

            {replying && (
              <div
                ref={replyRef}
                className={cn(
                  "pt-3",
                  isPending && "pointer-events-none opacity-70",
                )}
                aria-busy={isPending}
              >
                <Composer
                  maxLength={COMMENT_MAX_LENGTH}
                  placeholder={`Reply to ${comment.user.name}…`}
                  submitLabel="Reply"
                  ariaLabel="Write a reply"
                  rows={2}
                  autoFocus
                  maxHeight={240}
                  disabled={isPending}
                  onSubmit={(body) =>
                    new Promise<boolean>((resolve) => {
                      startTransition(async () => {
                        const ok = await onReply(comment.id, body);
                        if (ok) setReplying(false);
                        resolve(ok);
                      });
                    })
                  }
                  onCancel={() => setReplying(false)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {comment.replies.length > 0 && (
        <ul
          role="list"
          aria-label="Replies"
          className="ml-8 sm:ml-14 border-l border-border/60 divide-y divide-border/40"
        >
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              depth={depth + 1}
              isSignedIn={isSignedIn}
              onLike={onLike}
              onDelete={onDelete}
              onReply={onReply}
              pendingLikes={pendingLikes}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
