"use client";

import type { CommentWithMeta } from "@/app/(site)/blog/[[...slug]]/actions";
import { Avatar } from "@/app/(site)/blog/[[...slug]]/avatar";
import { CommentComposer } from "@/app/(site)/blog/[[...slug]]/comment-composer-area";
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
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/date";
import { SignInButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

export function CommentCard({
  comment,
  currentUserId,
  depth,
  userName,
  isSignedIn,
  onLike,
  onDelete,
  onReply,
  likePendingRef,
}: {
  comment: CommentWithMeta;
  currentUserId: string | null;
  depth: number;
  userName: string | null;
  isSignedIn: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (parentId: number, body: string) => void;
  likePendingRef: React.RefObject<Set<number>>;
}) {
  const [replying, setReplying] = useState(false);
  const replyRef = useRef<HTMLDivElement>(null);

  const isOptimistic = comment.id < 0;
  const isLikePending = likePendingRef.current?.has(comment.id) ?? false;
  const isOwn = currentUserId === comment.user.id;
  const canDelete = isOwn;

  useEffect(() => {
    if (replying && replyRef.current) {
      replyRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [replying]);

  return (
    <li
      className={cn(
        "relative",
        comment.isPinned && depth === 0 && "bg-primary/3",
      )}
    >
      {comment.isPinned && depth === 0 && (
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
              <TypographyMuted className="text-xs tabular-nums">
                <time dateTime={comment.createdAt}>
                  {timeAgo(comment.createdAt)}
                </time>
              </TypographyMuted>
              {comment.isPinned && depth === 0 && (
                <Badge
                  variant="secondary"
                  className="gap-1 h-4 px-1.5 text-[10px] py-0 font-medium"
                >
                  <PushPinSimpleIcon size={9} aria-hidden="true" />
                  Pinned
                </Badge>
              )}
            </div>

            <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {comment.body}
            </p>

            <div className="pt-0.5">
              <ButtonGroup>
                <Button
                  variant={comment.likedByMe ? "default" : "outline"}
                  size="sm"
                  onClick={() => !isOptimistic && onLike(comment.id)}
                  disabled={isOptimistic || isLikePending}
                  aria-pressed={comment.likedByMe}
                  aria-label={
                    comment.likedByMe
                      ? `Unlike (${comment.likeCount})`
                      : `Like (${comment.likeCount})`
                  }
                  className="gap-1.5"
                >
                  <HeartIcon
                    size={14}
                    weight={comment.likedByMe ? "fill" : "duotone"}
                    aria-hidden="true"
                  />
                  {comment.likeCount > 0 ? (
                    <span className="tabular-nums">{comment.likeCount}</span>
                  ) : (
                    <span className="hidden sm:inline">Like</span>
                  )}
                </Button>

                {depth < 2 && !isOptimistic && (
                  <>
                    <ButtonGroupSeparator />
                    {isSignedIn ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReplying((v) => !v)}
                        aria-expanded={replying}
                        aria-label="Reply to comment"
                        className="gap-1.5"
                      >
                        <ArrowBendDownRightIcon size={14} aria-hidden="true" />
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
              <div ref={replyRef} className="pt-3">
                <CommentComposer
                  userName={userName}
                  placeholder={`Reply to ${comment.user.name}…`}
                  isReply
                  onSubmit={(body) => {
                    onReply(comment.id, body);
                    setReplying(false);
                  }}
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
              userName={userName}
              isSignedIn={isSignedIn}
              onLike={onLike}
              onDelete={onDelete}
              onReply={onReply}
              likePendingRef={likePendingRef}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
