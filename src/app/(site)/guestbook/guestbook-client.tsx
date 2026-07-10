"use client";

import {
  deleteGuestbookEntry,
  getGuestbookEntries,
  submitGuestbookEntry,
  toggleLike,
  type GuestbookEntryWithMeta,
} from "@/app/(site)/guestbook/actions";
import { GuestbookEntry } from "@/app/(site)/guestbook/guestbook-entry";
import { Avatar } from "@/components/engagement/avatar";
import { Composer } from "@/components/engagement/composer";
import { EngagementEmptyState } from "@/components/engagement/empty-state";
import { EngagementNudge } from "@/components/engagement/nudge";
import { PanelHeader } from "@/components/engagement/panel";
import { Card } from "@/components/layouts/page";
import { BookOpenIcon, SignOutIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { nowISO } from "@/lib/date";
import { toastError } from "@/lib/toast";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { startTransition, useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_MESSAGE_LENGTH = 280;

interface GuestbookClientProps {
  initialEntries: GuestbookEntryWithMeta[];
  currentUserId: string | null;
  total: number;
  initialHasMore: boolean;
}

export function GuestbookClient({
  initialEntries,
  currentUserId,
  total,
  initialHasMore,
}: GuestbookClientProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [entries, setEntries] = useState(initialEntries);
  const [count, setCount] = useState(total);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const likePending = useRef<Set<number>>(new Set());

  const handleSubmit = useCallback(
    (message: string) => {
      if (!user) return;

      const tempId = -Date.now();
      const tempEntry: GuestbookEntryWithMeta = {
        id: tempId,
        message,
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

      setEntries((prev) => {
        const pinned = prev.filter((e) => e.isPinned);
        const rest = prev.filter((e) => !e.isPinned);
        return [...pinned, tempEntry, ...rest];
      });
      setCount((c) => c + 1);

      startTransition(async () => {
        const result = await submitGuestbookEntry(message);
        if (result.success) {
          setEntries((prev) =>
            prev.map((e) => (e.id === tempId ? { ...e, id: result.id } : e)),
          );
        } else {
          setEntries((prev) => prev.filter((e) => e.id !== tempId));
          setCount((c) => Math.max(0, c - 1));
          toastError(result.error);
        }
      });
    },
    [user],
  );

  const handleLike = useCallback(
    (id: number) => {
      if (!currentUserId) {
        toast.info("Sign in to like messages.");
        return;
      }
      if (id < 0 || likePending.current.has(id)) return;

      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const liked = !entry.likedByMe;

      likePending.current.add(id);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                likedByMe: liked,
                likeCount: liked ? e.likeCount + 1 : Math.max(0, e.likeCount - 1),
              }
            : e,
        ),
      );

      startTransition(async () => {
        const result = await toggleLike(id);
        likePending.current.delete(id);
        if (!result.success) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === id
                ? {
                    ...e,
                    likedByMe: !liked,
                    likeCount: liked
                      ? Math.max(0, e.likeCount - 1)
                      : e.likeCount + 1,
                  }
                : e,
            ),
          );
          toastError(result.error);
        }
      });
    },
    [currentUserId, entries],
  );

  const handleDelete = useCallback((id: number) => {
    toast("Delete this message?", {
      action: {
        label: "Delete",
        onClick: () => {
          setEntries((prev) => prev.filter((e) => e.id !== id));
          setCount((c) => Math.max(0, c - 1));
          startTransition(async () => {
            const result = await deleteGuestbookEntry(id);
            if (!result.success) toastError(result.error);
          });
        },
      },
      cancel: { label: "Keep", onClick: () => {} },
    });
  }, []);

  const handleLoadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const result = await getGuestbookEntries({ offset: entries.length });
      setEntries((prev) => {
        const seen = new Set(prev.map((e) => e.id));
        return [...prev, ...result.entries.filter((e) => !seen.has(e.id))];
      });
      setHasMore(result.hasMore);
      setCount(result.total);
    } catch {
      toast.error("Couldn't load more messages.");
    } finally {
      setLoadingMore(false);
    }
  }, [entries.length]);

  return (
    <div className="w-full space-y-6">
      <Card>
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
                <Avatar
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
                  <SignOutIcon size={14} aria-hidden="true" />
                  <span className="hidden sm:inline">Sign out</span>
                </Button>
              </ButtonGroup>
            </div>

            <Composer
              maxLength={MAX_MESSAGE_LENGTH}
              onSubmit={handleSubmit}
              placeholder="Say hi, share a thought, or just let me know you were here…"
              submitLabel="Send"
              ariaLabel="Your message"
              counterId="guestbook-counter"
              warnThreshold={40}
              dangerThreshold={10}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 @sm:flex-row @sm:items-center @sm:justify-between min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <TypographySmall className="font-semibold">
                  You stopped by. Leave a mark.
                </TypographySmall>
                <TypographyMuted className="text-sm text-pretty wrap-break-word">
                  Say hi, share a thought, or just let me know you were here.
                  Sign in — it only takes a second.
                </TypographyMuted>
              </div>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/guestbook"
                signUpForceRedirectUrl="/guestbook"
              >
                <ButtonGroup>
                  <Button size="sm" className="gap-1.5 font-semibold shrink-0">
                    <BookOpenIcon size={14} aria-hidden="true" />
                    Sign in
                  </Button>
                </ButtonGroup>
              </SignInButton>
            </div>
            <EngagementNudge type="guestbook" className="pt-1 text-left" />
          </>
        )}
      </Card>

      <Card className="p-0 @lg:p-0 overflow-hidden">
        <PanelHeader label="Messages" count={count} />

        <div className="relative z-10">
          {entries.length === 0 ? (
            <EngagementEmptyState
              title="Nobody here yet."
              description="Be the first to leave a mark. It takes 10 seconds."
            >
              <EngagementNudge type="guestbook" />
            </EngagementEmptyState>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="max-h-[60vh]">
                <ul
                  role="list"
                  aria-label="Guestbook messages"
                  className="divide-y divide-border"
                >
                  {entries.map((entry) => (
                    <GuestbookEntry
                      key={entry.id}
                      entry={entry}
                      currentUserId={currentUserId}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      likePendingRef={likePending}
                    />
                  ))}
                </ul>

                {hasMore && (
                  <div className="flex justify-center border-t p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      aria-busy={loadingMore}
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </Card>
    </div>
  );
}
