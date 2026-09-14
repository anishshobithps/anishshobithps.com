"use client";

import type { CommentWithMeta } from "@/app/(site)/blog/[[...slug]]/actions";
import { CommentCard } from "@/app/(site)/blog/[[...slug]]/_components/comment-card";
import { EngagementEmptyState } from "@/components/engagement/empty-state";
import { EngagementNudge } from "@/components/engagement/nudge";
import { PanelHeader } from "@/components/engagement/panel";
import { Card } from "@/components/layouts/page";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

export interface CommentListProps {
  comments: CommentWithMeta[];
  totalComments: number;
  currentUserId: string | null;
  isSignedIn: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (parentId: number, body: string) => Promise<boolean>;
  pendingLikes: ReadonlySet<number>;
}

export function CommentList({
  comments,
  totalComments,
  currentUserId,
  isSignedIn,
  onLike,
  onDelete,
  onReply,
  pendingLikes,
}: CommentListProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const commentVirtualizer = useVirtualizer({
    count: comments.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 180,
    overscan: 5,
  });

  return (
    <Card className="p-0 @lg:p-0 overflow-hidden">
      <PanelHeader label="Comments" count={totalComments} />

      {comments.length === 0 ? (
        <EngagementEmptyState
          title="Crickets. Loud ones."
          description="Be the first to say something — good, bad, or completely off the wall."
        >
          <EngagementNudge type="comment" />
        </EngagementEmptyState>
      ) : (
        <ScrollArea className="max-h-[60vh]" viewportRef={viewportRef}>
          <div className="max-h-[60vh]">
            <ul
              role="list"
              aria-label="Comments"
              className="relative"
              style={{ height: commentVirtualizer.getTotalSize() }}
            >
              {commentVirtualizer.getVirtualItems().map((row) => {
                const comment = comments[row.index]!;
                return (
                  <CommentCard
                    key={comment.id}
                    ref={commentVirtualizer.measureElement}
                    data-index={row.index}
                    className="border-b border-border"
                    style={{
                      position: "absolute",
                      insetInline: 0,
                      top: 0,
                      transform: `translateY(${row.start}px)`,
                    }}
                    comment={comment}
                    currentUserId={currentUserId}
                    depth={0}
                    isSignedIn={isSignedIn}
                    onLike={onLike}
                    onDelete={onDelete}
                    onReply={onReply}
                    pendingLikes={pendingLikes}
                  />
                );
              })}
            </ul>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
