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
    type ReactionCounts,
} from "@/app/blog/[[...slug]]/actions";
import { Card } from "@/components/layouts/page";
import {
    ArrowBendDownRightIcon,
    ChatCircleIcon,
    HeartIcon,
    PaperPlaneTiltIcon,
    PencilIcon,
    PushPinSimpleIcon,
    PushPinSimpleSlashIcon,
    SignInIcon,
    SignOutIcon,
    SmileyMehIcon,
    ThumbsDownIcon,
    ThumbsUpIcon,
    TrashIcon,
} from "@/components/shared/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ButtonGroup,
    ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    SectionLabel,
    TypographyMuted,
    TypographySmall,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { nowISO, timeAgo } from "@/lib/date";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import NextImage from "next/image";
import Link from "next/link";
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

const MOODS = [
  {
    id: "terrible" as MoodId,
    label: "Not for me",
    icon: ThumbsDownIcon,
    activeClassName:
      "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/15 hover:text-red-400",
    inactiveClassName:
      "hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400",
  },
  {
    id: "bad" as MoodId,
    label: "Meh",
    icon: SmileyMehIcon,
    activeClassName:
      "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/15 hover:text-orange-400",
    inactiveClassName:
      "hover:border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-400",
  },
  {
    id: "good" as MoodId,
    label: "Liked it",
    icon: ThumbsUpIcon,
    activeClassName:
      "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15 hover:text-blue-400",
    inactiveClassName:
      "hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-400",
  },
  {
    id: "amazing" as MoodId,
    label: "Loved it",
    icon: HeartIcon,
    activeClassName:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-400",
    inactiveClassName:
      "hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400",
  },
] as const;

interface MoodState {
  value: MoodId | "";
  counts: ReactionCounts;
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

function Avatar({
  imageUrl,
  name,
  size = "size-7 sm:size-8",
}: {
  imageUrl?: string | null;
  name: string;
  size?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 rounded-full overflow-hidden ring-1 ring-border",
          size,
        )}
      >
        <NextImage
          src={imageUrl}
          alt={name}
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        size,
        "shrink-0 rounded-full ring-1 ring-border bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground",
      )}
    >
      {initials}
    </div>
  );
}

function CommentComposer({
  userName,
  placeholder,
  onSubmit,
  onCancel,
  autoFocus = false,
  isReply = false,
}: {
  userName: string | null;
  placeholder?: string;
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  isReply?: boolean;
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const MAX = 1000;
  const remaining = MAX - body.length;

  const resolvedPlaceholder =
    placeholder ??
    (userName
      ? `${userName}, say something. I dare you.`
      : "Say something. I dare you.");

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  }, [body]);

  const handleSubmit = () => {
    if (!body.trim() || submitting) return;
    const trimmed = body.trim();
    setBody("");
    onSubmit(trimmed);
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={resolvedPlaceholder}
        rows={isReply ? 2 : 3}
        maxLength={MAX}
        aria-label={isReply ? "Write a reply" : "Write a comment"}
        className="resize-none overflow-hidden min-h-15"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span
            aria-live="polite"
            className={cn(
              "text-sm font-medium tabular-nums transition-colors duration-150",
              remaining <= 20
                ? "text-destructive"
                : remaining <= 100
                  ? "text-amber-500"
                  : "text-muted-foreground",
            )}
          >
            {remaining}
          </span>
          <TypographyMuted className="text-xs">
            / {MAX} characters left
          </TypographyMuted>
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!body.trim() || submitting || body.length > MAX}
            aria-busy={submitting}
            className="gap-1.5 font-semibold"
          >
            <PaperPlaneTiltIcon size={14} aria-hidden="true" />
            {submitting ? "Posting…" : isReply ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  currentUserId,
  siteOwnerId,
  depth,
  userName,
  isSignedIn,
  onLike,
  onDelete,
  onPin,
  onReply,
  likePendingRef,
}: {
  comment: CommentWithMeta;
  currentUserId: string | null;
  siteOwnerId: string;
  depth: number;
  userName: string | null;
  isSignedIn: boolean;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onPin: (id: number) => void;
  onReply: (parentId: number, body: string) => void;
  likePendingRef: React.RefObject<Set<number>>;
}) {
  const [replying, setReplying] = useState(false);
  const replyRef = useRef<HTMLDivElement>(null);

  const isOptimistic = comment.id < 0;
  const isLikePending = likePendingRef.current?.has(comment.id) ?? false;
  const isOwn = currentUserId === comment.user.id;
  const isSiteOwner = currentUserId === siteOwnerId;
  const canDelete = isOwn || isSiteOwner;
  const canPin = isSiteOwner && depth === 0;

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
          className="absolute left-0 top-0 h-full w-0.5 bg-primary/50"
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

                {canPin && !isOptimistic && (
                  <>
                    <ButtonGroupSeparator />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPin(comment.id)}
                      aria-pressed={comment.isPinned}
                      aria-label={comment.isPinned ? "Unpin" : "Pin"}
                      className={cn(
                        "gap-1.5",
                        comment.isPinned &&
                          "text-primary border-primary/40 bg-primary/5 hover:bg-primary/10 hover:text-primary",
                      )}
                    >
                      {comment.isPinned ? (
                        <PushPinSimpleSlashIcon size={14} aria-hidden="true" />
                      ) : (
                        <PushPinSimpleIcon size={14} aria-hidden="true" />
                      )}
                      <span className="hidden sm:inline">
                        {comment.isPinned ? "Unpin" : "Pin"}
                      </span>
                    </Button>
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
                  autoFocus
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
              siteOwnerId={siteOwnerId}
              depth={depth + 1}
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
      )}
    </li>
  );
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

  const [baseComments, setBaseComments] =
    useState<CommentWithMeta[]>(initialComments);
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
          <div className="space-y-3" aria-label="How was this read?">
            <TypographyMuted className="text-xs font-semibold uppercase tracking-widest text-center">
              How was this read?
            </TypographyMuted>
            <fieldset
              aria-label="Rate this post"
              className="flex flex-wrap gap-2 justify-center border-0 p-0 m-0"
            >
              {MOODS.map(
                ({
                  id,
                  label,
                  icon: Icon,
                  activeClassName,
                  inactiveClassName,
                }) => {
                  const isActive = moodOptimistic.value === id;
                  const count = moodLoading
                    ? null
                    : (moodOptimistic.counts[id] ?? 0);

                  return (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoodSelect(id)}
                      aria-pressed={isActive}
                      aria-label={`${label}${count !== null && count > 0 ? `, ${count} reaction${count === 1 ? "" : "s"}` : ""}`}
                      className={cn(
                        "gap-2 transition-[color,background-color,border-color] duration-150 cursor-pointer",
                        isActive ? activeClassName : inactiveClassName,
                      )}
                    >
                      <Icon size={14} aria-hidden="true" />
                      {label}
                      {count !== null && count > 0 && (
                        <span className="tabular-nums text-xs opacity-70">
                          {count}
                        </span>
                      )}
                    </Button>
                  );
                },
              )}
            </fieldset>
            <p className="text-center text-[11px] text-muted-foreground/50">
              No sign-in needed to react — only comments require an account.
            </p>
          </div>

          <div className="h-px bg-border/40" aria-hidden="true" />

          {isLoaded &&
            (isSignedIn ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar
                      imageUrl={user.imageUrl}
                      name={user.fullName || user.username || "You"}
                      size="size-6"
                    />
                    <TypographyMuted className="text-xs truncate">
                      Commenting as{" "}
                      <span className="text-foreground font-medium">
                        {user.fullName || user.username}
                      </span>
                    </TypographyMuted>
                  </div>
                  <ButtonGroup>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5 text-xs"
                    >
                      <Link href="/guestbook">
                        <PencilIcon size={13} aria-hidden="true" />
                        <span className="hidden sm:inline">
                          Checkout Guestbook!!
                        </span>
                      </Link>
                    </Button>
                    <ButtonGroupSeparator />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        signOut({ redirectUrl: window.location.pathname })
                      }
                      className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      aria-label="Sign out"
                    >
                      <SignOutIcon size={13} aria-hidden="true" />
                      <span className="hidden sm:inline">Sign out</span>
                    </Button>
                  </ButtonGroup>
                </div>
                <CommentComposer
                  userName={userName}
                  onSubmit={(body) => handleCommentSubmit(body)}
                />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 px-4 border bg-muted/30">
                <div className="space-y-0.5">
                  <TypographySmall className="font-semibold">
                    Got something to say?
                  </TypographySmall>
                  <TypographyMuted className="text-xs">
                    Sign in to comment. Also consider{" "}
                    <Link
                      href="/guestbook"
                      className="underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      leaving your mark on the guestbook
                    </Link>{" "}
                    — it&apos;s like a comments section but less chaotic.
                  </TypographyMuted>
                </div>
                <SignInButton mode="modal">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shrink-0"
                  >
                    <SignInIcon size={14} aria-hidden="true" />
                    Sign in
                  </Button>
                </SignInButton>
              </div>
            ))}
        </div>
      </Card>

      <Card className="p-0 @lg:p-0 overflow-hidden">
        <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5 border-b">
          <SectionLabel className="text-[11px]">Comments</SectionLabel>
          {totalComments > 0 && (
            <Badge
              variant="secondary"
              className="tabular-nums text-xs h-5 px-2"
            >
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
                    isSignedIn={!!isSignedIn}
                    onLike={handleCommentLike}
                    onDelete={handleCommentDelete}
                    onPin={handleCommentPin}
                    onReply={(parentId, body) =>
                      handleCommentSubmit(body, parentId)
                    }
                    likePendingRef={likePending}
                  />
                ))}
              </ul>
            </div>
          </ScrollArea>
        )}
      </Card>
    </div>
  );
}
