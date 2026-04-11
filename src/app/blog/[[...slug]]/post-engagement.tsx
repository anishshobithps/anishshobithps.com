"use client";

import {
  deleteComment,
  getReactions,
  submitComment,
  submitReaction,
  toggleCommentLike,
  togglePinComment,
  type CommentWithMeta,
  type MoodId,
} from "@/app/blog/[[...slug]]/actions";
import { CommentComposerArea } from "@/app/blog/[[...slug]]/comment-composer-area";
import { CommentList } from "@/app/blog/[[...slug]]/comment-list";
import { type MoodState, MoodPicker } from "@/app/blog/[[...slug]]/mood-picker";
import { Card } from "@/components/layouts/page";
import { SectionLabel } from "@/components/ui/typography";
import { nowISO } from "@/lib/date";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  startTransition,
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type ToastType = "error" | "warning" | "info" | "success";

function typedToast(type: ToastType, message: string) {
  toast[type](message);
}

function classifyError(error: string): ToastType {
  const msg = error.toLowerCase();
  if (
    msg.includes("permission") ||
    msg.includes("not allowed") ||
    msg.includes("unauthorized")
  )
    return "warning";
  if (
    msg.includes("sign in") ||
    msg.includes("logged in") ||
    msg.includes("auth")
  )
    return "info";
  return "error";
}

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

function patchPin(
  list: CommentWithMeta[],
  id: number,
  pinned: boolean,
): CommentWithMeta[] {
  const patched = list.map((c) => ({
    ...c,
    ...(c.id === id ? { isPinned: pinned } : {}),
    replies: patchPin(c.replies, id, pinned),
  }));
  return patched.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });
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

interface PostEngagementProps {
  slug: string;
  initialComments: CommentWithMeta[];
  currentUserId: string | null;
  siteOwnerId: string;
}

export function PostEngagement({
  slug,
  initialComments,
  currentUserId,
  siteOwnerId,
}: PostEngagementProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [moodState, setMoodState] = useState<MoodState>({
    value: "",
    counts: {},
  });
  const [moodLoading, setMoodLoading] = useState(true);

  const [moodOptimistic, addMoodOptimistic] = useOptimistic<
    MoodState,
    { newMood: MoodId | ""; prevMood: MoodId | "" }
  >(moodState, (state, { newMood, prevMood }) => {
    const nextCounts = { ...state.counts };
    if (prevMood)
      nextCounts[prevMood] = Math.max(0, (nextCounts[prevMood] ?? 0) - 1);
    if (newMood) nextCounts[newMood] = (nextCounts[newMood] ?? 0) + 1;
    return { value: newMood, counts: nextCounts };
  });

  const [baseComments, setBaseComments] = useState<CommentWithMeta[]>(
    () => initialComments,
  );
  const likePending = useRef<Set<number>>(new Set());

  const comments = baseComments;

  useEffect(() => {
    getReactions(slug)
      .then(({ counts, userMood }) => {
        setMoodState({ value: userMood ?? "", counts });
      })
      .finally(() => setMoodLoading(false));
  }, [slug]);

  const handleMoodSelect = (id: MoodId) => {
    const prevMood = moodOptimistic.value;
    const newMood: MoodId | "" = prevMood === id ? "" : id;

    startTransition(async () => {
      addMoodOptimistic({ newMood, prevMood });
      await submitReaction(slug, newMood || null);
      const { counts, userMood } = await getReactions(slug);
      setMoodState({ value: userMood ?? "", counts });
    });
  };

  const handleCommentSubmit = useCallback(
    (body: string, parentId?: number) => {
      if (!user) return;

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

      startTransition(async () => {
        const result = await submitComment(slug, body, parentId);
        if (result.success) {
          setBaseComments((prev) => patchConfirm(prev, tempId, result.id));
        } else {
          setBaseComments((prev) => patchDelete(prev, tempId));
          typedToast(classifyError(result.error), result.error);
        }
      });
    },
    [user, slug],
  );

  const handleCommentDelete = useCallback((id: number) => {
    setBaseComments((prev) => patchDelete(prev, id));
    startTransition(async () => {
      const result = await deleteComment(id);
      if (!result.success)
        typedToast(classifyError(result.error), result.error);
    });
  }, []);

  const handleCommentPin = useCallback(
    (id: number) => {
      const comment = findComment(baseComments, id);
      if (!comment) return;
      const pinned = !comment.isPinned;

      const pinned_list = patchPin(baseComments, id, pinned);
      setBaseComments(pinned_list);
      startTransition(async () => {
        const result = await togglePinComment(id);
        if (!result.success) {
          setBaseComments((prev) => patchPin(prev, id, !pinned));
          typedToast(classifyError(result.error), result.error);
        }
      });
    },
    [baseComments],
  );

  const handleCommentLike = useCallback(
    (id: number) => {
      if (!currentUserId) {
        typedToast("info", "Sign in to like comments.");
        return;
      }
      if (id < 0 || likePending.current.has(id)) return;

      const comment = findComment(baseComments, id);
      if (!comment) return;
      const liked = !comment.likedByMe;

      likePending.current.add(id);

      setBaseComments((prev) => patchLike(prev, id, liked));
      startTransition(async () => {
        const result = await toggleCommentLike(id);
        likePending.current.delete(id);
        if (!result.success) {
          setBaseComments((prev) => patchLike(prev, id, !liked));
          typedToast(classifyError(result.error), result.error);
        }
      });
    },
    [currentUserId, baseComments],
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
            moodOptimistic={moodOptimistic}
            moodLoading={moodLoading}
            onSelect={handleMoodSelect}
          />

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
        siteOwnerId={siteOwnerId}
        userName={userName}
        isSignedIn={!!isSignedIn}
        onLike={handleCommentLike}
        onDelete={handleCommentDelete}
        onPin={handleCommentPin}
        onReply={(parentId, body) => handleCommentSubmit(body, parentId)}
        likePendingRef={likePending}
      />
    </div>
  );
}
