"use client";

import type { CommentWithMeta } from "@/app/(site)/blog/[[...slug]]/actions";
import { CommentCard } from "@/app/(site)/blog/[[...slug]]/_components/comment-card";
import { EngagementEmptyState } from "@/components/engagement/empty-state";
import { EngagementNudge } from "@/components/engagement/nudge";
import { PanelHeader } from "@/components/engagement/panel";
import { Card } from "@/components/layouts/page";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface CommentListProps {
  comments: CommentWithMeta[];
  totalComments: number;
  currentUserId: string | null;
  isSignedIn: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onReply: (parentId: number, body: string) => void;
  likePendingRef: React.RefObject<Set<number>>;
}

export function CommentList({
  comments,
  totalComments,
  currentUserId,
  isSignedIn,
  onLike,
  onDelete,
  onReply,
  likePendingRef,
}: CommentListProps) {
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
        <ScrollArea className="max-h-[60vh]">
          <div className="max-h-[60vh]">
            <ul
              role="list"
              aria-label="Comments"
              className="divide-y divide-border"
            >
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  depth={0}
                  isSignedIn={isSignedIn}
                  onLike={onLike}
                  onDelete={onDelete}
                  onReply={onReply}
                  likePendingRef={likePendingRef}
                />
              ))}
            </ul>
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
