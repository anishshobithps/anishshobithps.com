"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  startTransition,
} from "react";
import { useUser, SignInButton, useClerk } from "@clerk/nextjs";
import { timeAgo, toTimestamp, nowISO } from "@/lib/date";
import {
  IconHeart,
  IconHeartFilled,
  IconPin,
  IconPinnedFilled,
  IconTrash,
  IconSend,
  IconBook,
  IconLogout,
  IconMessageCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image } from "@/components/ui/image";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { DecorIcon } from "@/components/ui/border";
import {
  TypographySmall,
  TypographyMuted,
  SectionLabel,
} from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import {
  submitGuestbookEntry,
  deleteGuestbookEntry,
  togglePinEntry,
  toggleLike,
  type GuestbookEntryWithMeta,
} from "@/app/guestbook/actions";

interface GuestbookClientProps {
  initialEntries: GuestbookEntryWithMeta[];
  currentUserId: string | null;
  siteOwnerId: string;
  total: number;
}

type OptimisticAction =
  | { type: "add"; entry: GuestbookEntryWithMeta }
  | { type: "delete"; id: number }
  | { type: "like"; id: number; liked: boolean }
  | { type: "pin"; id: number; pinned: boolean };

function UserAvatar({
  imageUrl,
  name,
  className,
  size = "size-7 sm:size-8",
}: {
  imageUrl: string | null | undefined;
  name: string;
  className?: string;
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
      <Image
        src={imageUrl}
        alt={name}
        fill
        sizes="36px"
        rounded="full"
        containerClassName={cn(size, "shrink-0 ring-1 ring-border", className)}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={cn(
        size,
        "shrink-0 rounded-full ring-1 ring-border bg-muted",
        "flex items-center justify-center",
        "text-[10px] font-semibold text-muted-foreground",
        className,
      )}
    >
      {initials}
    </div>
  );
}

function optimisticReducer(
  state: GuestbookEntryWithMeta[],
  action: OptimisticAction,
): GuestbookEntryWithMeta[] {
  switch (action.type) {
    case "add":
      return [action.entry, ...state];
    case "delete":
      return state.filter((e) => e.id !== action.id);
    case "like":
      return state.map((e) =>
        e.id === action.id
          ? {
              ...e,
              likedByMe: action.liked,
              likeCount: action.liked
                ? e.likeCount + 1
                : Math.max(0, e.likeCount - 1),
            }
          : e,
      );
    case "pin":
      return state
        .map((e) =>
          e.id === action.id ? { ...e, isPinned: action.pinned } : e,
        )
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
        });
    default:
      return state;
  }
}

function EntryCard({
  entry,
  currentUserId,
  siteOwnerId,
  onLike,
  onDelete,
  onPin,
}: {
  entry: GuestbookEntryWithMeta;
  currentUserId: string | null;
  siteOwnerId: string;
  onLike: (id: number) => void;
  onDelete: (id: number) => void;
  onPin: (id: number) => void;
}) {
  const isOwner = currentUserId === entry.user.id;
  const isSiteOwner = currentUserId === siteOwnerId;
  const canDelete = isOwner || isSiteOwner;
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);
  const msgRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = msgRef.current;
    if (!el) return;

    const checkClamp = () => {
      const isOverflowing = el.scrollHeight > el.clientHeight + 1;
      setIsClamped(isOverflowing);
    };

    // run after layout
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
        <UserAvatar imageUrl={entry.user.imageUrl} name={entry.user.name} />

        <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <TypographySmall className="font-semibold leading-none">
              {entry.user.name}
            </TypographySmall>
            <TypographyMuted className="text-xs tabular-nums">
              <time dateTime={entry.createdAt}>{timeAgo(entry.createdAt)}</time>
            </TypographyMuted>
            {entry.isPinned && (
              <Badge
                variant="secondary"
                className="gap-1 h-4 px-1.5 text-[10px] py-0"
              >
                <IconPinnedFilled size={10} aria-hidden="true" />
                Pinned
              </Badge>
            )}
          </div>

          <p
            ref={msgRef}
            className={cn(
              "text-[13px] sm:text-sm leading-relaxed wrap-anywhere",
              !expanded && "line-clamp-3",
            )}
          >
            {entry.message}
          </p>

          {(isClamped || expanded) && (
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          <div className="pt-0.5">
            <ButtonGroup>
              <Button
                variant={entry.likedByMe ? "default" : "outline"}
                size="sm"
                onClick={() => onLike(entry.id)}
                disabled={!currentUserId}
                aria-pressed={entry.likedByMe}
                aria-label={
                  entry.likedByMe
                    ? `Unlike (${entry.likeCount})`
                    : `Like (${entry.likeCount})`
                }
                className="gap-1.5"
              >
                {entry.likedByMe ? (
                  <IconHeartFilled size={14} aria-hidden="true" />
                ) : (
                  <IconHeart size={14} aria-hidden="true" />
                )}
                {entry.likeCount > 0 && (
                  <span className="tabular-nums">{entry.likeCount}</span>
                )}
                {entry.likeCount === 0 && (
                  <span className="hidden sm:inline">Like</span>
                )}
              </Button>

              {isSiteOwner && (
                <>
                  <ButtonGroupSeparator />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPin(entry.id)}
                    aria-pressed={entry.isPinned}
                    aria-label={entry.isPinned ? "Unpin" : "Pin"}
                    className="gap-1.5"
                  >
                    {entry.isPinned ? (
                      <IconPinnedFilled size={14} aria-hidden="true" />
                    ) : (
                      <IconPin size={14} aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">
                      {entry.isPinned ? "Unpin" : "Pin"}
                    </span>
                  </Button>
                </>
              )}

              {canDelete && (
                <>
                  <ButtonGroupSeparator />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(entry.id)}
                    aria-label="Delete message"
                    className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  >
                    <IconTrash size={14} aria-hidden="true" />
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
}

export function GuestbookClient({
  initialEntries,
  currentUserId,
  siteOwnerId,
  total,
}: GuestbookClientProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX = 280;
  const remaining = MAX - message.length;
  const isNearLimit = remaining <= 40;
  const isAtLimit = remaining <= 10;

  const [entries, dispatchOptimistic] = useOptimistic<
    GuestbookEntryWithMeta[],
    OptimisticAction
  >(initialEntries, optimisticReducer);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [message]);

  const handleSubmit = async () => {
    if (!message.trim() || submitting || !user) return;

    const tempEntry: GuestbookEntryWithMeta = {
      id: Date.now(),
      message: message.trim(),
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
    };

    setSubmitting(true);
    setMessage("");

    startTransition(async () => {
      dispatchOptimistic({ type: "add", entry: tempEntry });
      const result = await submitGuestbookEntry(tempEntry.message);
      if (!result.success) toast.error(result.error);
    });

    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleLike = (id: number) => {
    if (!currentUserId) {
      toast.info("Sign in to like messages.");
      return;
    }
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    startTransition(async () => {
      dispatchOptimistic({ type: "like", id, liked: !entry.likedByMe });
      const result = await toggleLike(id);
      if (!result.success) toast.error(result.error);
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      dispatchOptimistic({ type: "delete", id });
      const result = await deleteGuestbookEntry(id);
      if (!result.success) toast.error(result.error);
    });
  };

  const handlePin = (id: number) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    startTransition(async () => {
      dispatchOptimistic({ type: "pin", id, pinned: !entry.isPinned });
      const result = await togglePinEntry(id);
      if (!result.success) toast.error(result.error);
    });
  };

  return (
    <div className="w-full space-y-6">
      <div className={cn("relative", "p-0 border-0", "p-4 lg:p-6 lg:border")}>
        <div className="hidden lg:block" aria-hidden="true">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />
        </div>

        <div className="relative z-10">
          {!isLoaded ? (
            <div
              className="h-12 animate-pulse bg-muted rounded"
              aria-busy="true"
              aria-label="Loading…"
            />
          ) : isSignedIn ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar
                    imageUrl={user?.imageUrl}
                    name={user?.fullName || user?.username || "You"}
                    size="size-7"
                  />
                  <TypographySmall className="font-semibold truncate">
                    {user?.fullName || user?.username}
                  </TypographySmall>
                </div>

                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut({ redirectUrl: "/guestbook" })}
                    aria-label="Sign out"
                    className="gap-1.5"
                  >
                    <IconLogout size={14} aria-hidden="true" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </ButtonGroup>
              </div>

              <div>
                <label htmlFor="guestbook-message" className="sr-only">
                  Your message
                </label>
                <Textarea
                  id="guestbook-message"
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={3}
                  maxLength={MAX}
                  placeholder="Leave a message for the world…"
                  aria-describedby="guestbook-counter"
                  className="resize-none min-h-[80px] max-h-[200px]"
                  autoComplete="off"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    id="guestbook-counter"
                    aria-live="polite"
                    aria-label={`${remaining} of ${MAX} characters remaining`}
                    className={cn(
                      "text-sm font-medium tabular-nums transition-colors duration-150",
                      isAtLimit
                        ? "text-destructive"
                        : isNearLimit
                          ? "text-amber-500"
                          : "text-muted-foreground",
                    )}
                  >
                    {remaining}
                  </span>
                  <TypographyMuted className="text-xs">/ {MAX}</TypographyMuted>
                </div>

                <ButtonGroup>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitting || !message.trim()}
                    aria-busy={submitting}
                    className="gap-1.5 font-semibold"
                  >
                    <IconSend size={14} aria-hidden="true" />
                    {submitting ? "Sending…" : "Send"}
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
              {" "}
              <div className="space-y-1 min-w-0 flex-1">
                {" "}
                <TypographySmall className="font-semibold">
                  Drop something in the guestbook.
                </TypographySmall>
                <TypographyMuted className="text-sm text-pretty break-words">
                  {" "}
                  Say hi, share a thought, or just let me know you were here.
                  You gotta sign in first 🙂
                </TypographyMuted>
              </div>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/guestbook"
                signUpForceRedirectUrl="/guestbook"
              >
                <ButtonGroup>
                  <Button size="sm" className="gap-1.5 font-semibold shrink-0">
                    <IconBook size={14} aria-hidden="true" />
                    Sign in
                  </Button>
                </ButtonGroup>
              </SignInButton>
            </div>
          )}
        </div>
      </div>

      <div className={cn("relative", "p-0 border-0", "lg:border")}>
        <div className="hidden lg:block" aria-hidden="true">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2.5 sm:px-6 border-b">
          <SectionLabel className="text-[11px]">Messages</SectionLabel>
          {total > 0 && (
            <Badge
              variant="secondary"
              className="tabular-nums text-xs h-5 px-2"
            >
              {total}
            </Badge>
          )}
        </div>

        <div className="relative z-10">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 sm:py-16 sm:px-6 text-center">
              <div
                className="size-9 border flex items-center justify-center text-muted-foreground"
                aria-hidden="true"
              >
                <IconMessageCircle size={18} />
              </div>
              <div className="space-y-1">
                <TypographySmall className="font-semibold">
                  No messages yet
                </TypographySmall>
                <TypographyMuted className="text-xs text-pretty">
                  Be the first to leave a note.
                </TypographyMuted>
              </div>
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="max-h-[60vh]">
                <ul
                  role="list"
                  aria-label="Guestbook messages"
                  className="divide-y divide-border"
                >
                  {entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      currentUserId={currentUserId}
                      siteOwnerId={siteOwnerId}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      onPin={handlePin}
                    />
                  ))}
                </ul>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
