"use client";

import type { CommentWithMeta } from "@/app/blog/[[...slug]]/actions";
import { CommentCard } from "@/app/blog/[[...slug]]/comment-card";
import { Card } from "@/components/layouts/page";
import { ChatCircleIcon } from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SectionLabel,
  TypographyMuted,
  TypographySmall,
} from "@/components/ui/typography";

export interface CommentListProps {
  comments: CommentWithMeta[];
  totalComments: number;
  currentUserId: string | null;
  siteOwnerId: string;
  userName: string | null;
  isSignedIn: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onPin: (id: number) => void;
  onReply: (parentId: number, body: string) => void;
  likePendingRef: React.RefObject<Set<number>>;
}

export function CommentList({
  comments,
  totalComments,
  currentUserId,
  siteOwnerId,
  userName,
  isSignedIn,
  onLike,
  onDelete,
  onPin,
  onReply,
  likePendingRef,
}: CommentListProps) {
  return (
    <Card className="p-0 @lg:p-0 overflow-hidden">
      <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5 border-b">
        <SectionLabel className="text-[11px]">Comments</SectionLabel>
        {totalComments > 0 && (
          <Badge variant="secondary" className="tabular-nums text-xs h-5 px-2">
            {totalComments}
          </Badge>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 sm:py-16 sm:px-6 text-center">
          <div
            className="size-9 border flex items-center justify-center text-muted-foreground"
            aria-hidden="true"
          >
            <ChatCircleIcon size={18} />
          </div>
          <div className="space-y-1">
            <TypographySmall className="font-semibold">
              Crickets. Loud ones.
            </TypographySmall>
            <TypographyMuted className="text-xs">
              Be the first to say something — good, bad, or unhinged.
            </TypographyMuted>
          </div>
        </div>
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
                  siteOwnerId={siteOwnerId}
                  depth={0}
                  userName={userName}
                  isSignedIn={isSignedIn}
                  onLike={onLike}
                  onDelete={onDelete}
                  onPin={onPin}
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
