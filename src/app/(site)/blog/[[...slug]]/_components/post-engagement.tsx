"use client";

import {
  deleteComment,
  getReactions,
  submitComment,
  submitReaction,
  toggleCommentLike,
  type CommentWithMeta,
  type MoodId,
} from "@/app/(site)/blog/[[...slug]]/actions";
import { CommentComposerArea } from "@/app/(site)/blog/[[...slug]]/_components/comment-composer-area";
import { CommentList } from "@/app/(site)/blog/[[...slug]]/_components/comment-list";
import {
  type MoodState,
  MoodPicker,
} from "@/app/(site)/blog/[[...slug]]/_components/mood-picker";
import { Card } from "@/components/layouts/page";
import { SectionLabel, TypographyMuted } from "@/components/ui/typography";
import { nowISO } from "@/lib/date";
import { classifyError, typedToast } from "@/lib/toast";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

function patchLike(
  list: CommentWithMeta[],
  id: number,
  liked: boolean,
): CommentWithMeta[] {
  return list.map((c) => ({
    ...c,
    ...(c.id === id
      ? {
          likedByMe: liked,
          likeCount: liked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1),
        }
      : {}),
    replies: patchLike(c.replies, id, liked),
  }));
}

function patchAdd(
  list: CommentWithMeta[],
  comment: CommentWithMeta,
  parentId?: number,
): CommentWithMeta[] {
  if (!parentId) {
    const pinned = list.filter((c) => c.isPinned);
    const rest = list.filter((c) => !c.isPinned);
    return [...pinned, comment, ...rest];
  }
  return list.map((c) =>
    c.id === parentId
      ? { ...c, replies: [...c.replies, comment] }
      : { ...c, replies: patchAdd(c.replies, comment, parentId) },
  );
}

function patchDelete(list: CommentWithMeta[], id: number): CommentWithMeta[] {
  return list
    .filter((c) => c.id !== id)
    .map((c) => ({ ...c, replies: patchDelete(c.replies, id) }));
}

function patchConfirm(
  list: CommentWithMeta[],
  tempId: number,
  realId: number,
): CommentWithMeta[] {
  return list.map((c) => ({
    ...(c.id === tempId ? { ...c, id: realId } : c),
    replies: patchConfirm(c.replies, tempId, realId),
  }));
}

function findComment(
  list: CommentWithMeta[],
  id: number,
): CommentWithMeta | undefined {
  for (const c of list) {
    if (c.id === id) return c;
    const found = findComment(c.replies, id);
    if (found) return found;
  }
}

const EMPTY_MOOD: MoodState = { value: "", counts: {} };

function applyMood(state: MoodState, next: MoodId | ""): MoodState {
  const counts = { ...state.counts };
  if (state.value) {
    counts[state.value] = Math.max(0, (counts[state.value] ?? 0) - 1);
  }
  if (next) counts[next] = (counts[next] ?? 0) + 1;
  return { value: next, counts };
}

interface PostEngagementProps {
  slug: string;
  initialComments: CommentWithMeta[];
  currentUserId: string | null;
}

export function PostEngagement({
  slug,
  initialComments,
  currentUserId,
}: PostEngagementProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const queryClient = useQueryClient();
  const reactionsKey = useMemo(() => queryKeys.reactions(slug), [slug]);

  const { data: moodState = EMPTY_MOOD, isPending: moodLoading } = useQuery({
    queryKey: reactionsKey,
    queryFn: async (): Promise<MoodState> => {
      const { counts, userMood } = await getReactions(slug);
      return { value: userMood ?? "", counts };
    },
  });

  const { mutate: selectMood } = useMutation({
    mutationFn: (mood: MoodId | "") => submitReaction(slug, mood || null),
    onMutate: async (mood) => {
      await queryClient.cancelQueries({ queryKey: reactionsKey });
      const previous = queryClient.getQueryData<MoodState>(reactionsKey);
      queryClient.setQueryData<MoodState>(reactionsKey, (old) =>
        applyMood(old ?? EMPTY_MOOD, mood),
      );
      return { previous };
    },
    onError: (_error, _mood, context) => {
      if (context?.previous) {
        queryClient.setQueryData(reactionsKey, context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: reactionsKey }),
  });

  const [baseComments, setBaseComments] = useState<CommentWithMeta[]>(
    () => initialComments,
  );
  const likeGuard = useRef<Set<number>>(new Set());
  const [pendingLikes, setPendingLikes] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const comments = baseComments;

  const reactionTotal = useMemo(
    () =>
      Object.values(moodState.counts).reduce(
        (sum, count) => sum + (count ?? 0),
        0,
      ),
    [moodState.counts],
  );

  const handleMoodSelect = (id: MoodId) => {
    selectMood(moodState.value === id ? "" : id);
  };

  const postComment = useMutation({
    mutationFn: async ({
      body,
      parentId,
    }: {
      body: string;
      parentId?: number;
      tempId: number;
    }) => {
      const result = await submitComment(slug, body, parentId);
      if (!result.success) throw new Error(result.error);
      return result.id;
    },
    onSuccess: (id, { tempId }) =>
      setBaseComments((prev) => patchConfirm(prev, tempId, id)),
    onError: (error, { tempId }) => {
      setBaseComments((prev) => patchDelete(prev, tempId));
      typedToast(classifyError(error.message), error.message);
    },
  });

  const removeComment = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteComment(id);
      if (!result.success) throw new Error(result.error);
    },
    onMutate: (id) => setBaseComments((prev) => patchDelete(prev, id)),
    onError: (error) =>
      typedToast(classifyError(error.message), error.message),
  });

  const likeComment = useMutation({
    mutationFn: async ({ id }: { id: number; liked: boolean }) => {
      const result = await toggleCommentLike(id);
      if (!result.success) throw new Error(result.error);
    },
    onError: (error, { id, liked }) => {
      setBaseComments((prev) => patchLike(prev, id, !liked));
      typedToast(classifyError(error.message), error.message);
    },
    onSettled: (_data, _error, { id }) => {
      likeGuard.current.delete(id);
      setPendingLikes((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
  });

  const handleCommentSubmit = useCallback(
    (body: string, parentId?: number): Promise<boolean> => {
      if (!user) return Promise.resolve(false);

      const tempId = -Date.now();
      const tempComment: CommentWithMeta = {
        id: tempId,
        slug,
        parentId: parentId ?? null,
        body,
        isPinned: false,
        createdAt: nowISO(),
        likeCount: 0,
        likedByMe: false,
        user: {
          id: user.id,
          name: user.fullName || user.username || "You",
          username: user.username,
          imageUrl: user.imageUrl,
        },
        replies: [],
      };

      setBaseComments((prev) => patchAdd(prev, tempComment, parentId));

      return postComment
        .mutateAsync({ body, parentId, tempId })
        .then(() => true)
        .catch(() => false);
    },
    [user, slug, postComment],
  );

  const handleCommentDelete = useCallback((id: number) => {
    toast("Delete this comment?", {
      action: {
        label: "Delete",
        onClick: () => removeComment.mutate(id),
      },
      cancel: { label: "Keep", onClick: () => {} },
    });
  }, [removeComment]);

  const handleCommentLike = useCallback(
    (id: number) => {
      if (!currentUserId) {
        typedToast("info", "Sign in to like comments.");
        return;
      }
      if (id < 0 || likeGuard.current.has(id)) return;

      const comment = findComment(baseComments, id);
      if (!comment) return;
      const liked = !comment.likedByMe;

      likeGuard.current.add(id);
      setPendingLikes((prev) => new Set(prev).add(id));

      setBaseComments((prev) => patchLike(prev, id, liked));
      likeComment.mutate({ id, liked });
    },
    [currentUserId, baseComments, likeComment],
  );


  const totalComments = comments.reduce(
    (acc, c) => acc + 1 + c.replies.length,
    0,
  );
  const userName = user ? user.fullName || user.username : null;

  return (
    <div className="space-y-8" aria-label="Post engagement">
      <div className="flex items-center gap-3" aria-hidden="true">
        <SectionLabel>
          {totalComments > 0
            ? `${totalComments} thought${totalComments === 1 ? "" : "s"} (and a vibe check)`
            : "Vibe check + thoughts"}
        </SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <Card>
        <div className="space-y-8">
          <MoodPicker
            moodOptimistic={moodState}
            moodLoading={moodLoading}
            onSelect={handleMoodSelect}
          />

          {!moodLoading && reactionTotal === 0 && (
            <TypographyMuted className="text-center text-xs">
              Nothing here yet. Be the first to react.
            </TypographyMuted>
          )}

          <div className="h-px bg-border/40" aria-hidden="true" />

          <CommentComposerArea
            isLoaded={isLoaded}
            isSignedIn={isSignedIn}
            user={user}
            userName={userName}
            onSubmit={(body) => handleCommentSubmit(body)}
            onSignOut={() => signOut({ redirectUrl: window.location.pathname })}
          />
        </div>
      </Card>

      <CommentList
        comments={comments}
        totalComments={totalComments}
        currentUserId={currentUserId}
        isSignedIn={!!isSignedIn}
        onLike={handleCommentLike}
        onDelete={handleCommentDelete}
        onReply={(parentId, body) => handleCommentSubmit(body, parentId)}
        pendingLikes={pendingLikes}
      />
    </div>
  );
}
