"use client";

import type { CommentWithMeta } from "@/app/(site)/blog/[[...slug]]/actions";
import { CommentCard } from "@/app/(site)/blog/[[...slug]]/_components/comment-card";
import { CricketDoodle } from "@/components/shared/doodles";
import { EngagementEmptyState } from "@/components/engagement/empty-state";
import { EngagementNudge } from "@/components/engagement/nudge";
import { PanelHeader } from "@/components/engagement/panel";
import { PanelRow, panelListItem } from "@/components/layouts/page";
import { ScrollArea } from "@repo/ui/components/scroll-area";
import { useVirtualList } from "@repo/virtual/use-virtual-list";

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
  const commentList = useVirtualList({
    count: comments.length,
    estimateSize: 180,
    overscan: 5,
  });

  return (
    <>
      <PanelHeader label="Comments" count={totalComments} />

      {comments.length === 0 ? (
        <PanelRow>
          <EngagementEmptyState
            art={<CricketDoodle />}
            title="Crickets. Loud ones."
            description="Be the first to say something, good or bad or completely off the wall."
          >
            <EngagementNudge type="comment" />
          </EngagementEmptyState>
        </PanelRow>
      ) : (
        <ScrollArea className="max-h-[60vh]" viewportRef={commentList.viewportRef}>
          <div className="max-h-[60vh]">
            <ul
              role="list"
              aria-label="Comments"
              className="relative"
              style={{ height: commentList.totalSize }}
            >
              {commentList.items.map((row) => {
                const comment = comments[row.index]!;
                return (
                  <CommentCard
                    key={comment.id}
                    {...commentList.itemProps(row)}
                    className={panelListItem}
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
    </>
  );
}
