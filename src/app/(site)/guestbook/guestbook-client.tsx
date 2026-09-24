"use client";

import {
  deleteGuestbookEntry,
  getGuestbookEntries,
  submitGuestbookEntry,
  toggleLike,
  type GetEntriesResult,
  type GuestbookEntryWithMeta,
} from "@/app/(site)/guestbook/actions";
import { GuestbookEntry } from "@/app/(site)/guestbook/guestbook-entry";
import { Avatar } from "@/components/engagement/avatar";
import { Composer } from "@/components/engagement/composer";
import { EngagementEmptyState } from "@/components/engagement/empty-state";
import { EngagementNudge } from "@/components/engagement/nudge";
import { PanelHeader } from "@/components/engagement/panel";
import { Panel, PanelRow, panelListItem } from "@/components/layouts/page";
import { BookOpenIcon, SignOutIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { nowISO } from "@/lib/date";
import { toastError } from "@/lib/toast";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const MAX_MESSAGE_LENGTH = 280;
const GUESTBOOK_KEY = ["guestbook"] as const;

type GuestbookPages = InfiniteData<GetEntriesResult>;

function sortEntries(
  entries: GuestbookEntryWithMeta[],
): GuestbookEntryWithMeta[] {
  return [
    ...entries.filter((entry) => entry.isPinned),
    ...entries.filter((entry) => !entry.isPinned),
  ];
}

interface GuestbookClientProps {
  currentUserId: string | null;
}

export function GuestbookClient({ currentUserId }: GuestbookClientProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError: loadMoreFailed,
  } = useInfiniteQuery({
    queryKey: GUESTBOOK_KEY,
    queryFn: ({ pageParam }) => getGuestbookEntries({ offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore
        ? allPages.reduce((seen, page) => seen + page.entries.length, 0)
        : undefined,
  });

  const entries = useMemo(() => {
    const seen = new Set<number>();
    return (data?.pages ?? [])
      .flatMap((page) => page.entries)
      .filter((entry) => !seen.has(entry.id) && seen.add(entry.id));
  }, [data]);

  const count = data?.pages.at(-1)?.total ?? 0;
  const hasMore = hasNextPage;

  const setPages = useCallback(
    (update: (pages: GetEntriesResult[]) => GetEntriesResult[]) =>
      queryClient.setQueryData<GuestbookPages>(GUESTBOOK_KEY, (old) =>
        old ? { ...old, pages: update(old.pages) } : old,
      ),
    [queryClient],
  );

  const patchEntries = useCallback(
    (update: (entries: GuestbookEntryWithMeta[]) => GuestbookEntryWithMeta[]) =>
      setPages((pages) =>
        pages.map((page) => ({ ...page, entries: update(page.entries) })),
      ),
    [setPages],
  );

  const bumpTotal = useCallback(
    (delta: number) =>
      setPages((pages) =>
        pages.map((page) => ({
          ...page,
          total: Math.max(0, page.total + delta),
        })),
      ),
    [setPages],
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const likeGuard = useRef<Set<number>>(new Set());
  const [pendingLikes, setPendingLikes] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const submitEntry = useMutation({
    mutationFn: async ({ message }: { message: string; tempId: number }) => {
      const result = await submitGuestbookEntry(message);
      if (!result.success) throw new Error(result.error);
      return result.id;
    },
    onSuccess: (id, { tempId }) =>
      patchEntries((list) =>
        list.map((entry) => (entry.id === tempId ? { ...entry, id } : entry)),
      ),
    onError: (error, { tempId }) => {
      patchEntries((list) => list.filter((entry) => entry.id !== tempId));
      bumpTotal(-1);
      toastError(error.message);
    },
  });

  const likeEntry = useMutation({
    mutationFn: async ({ id }: { id: number; liked: boolean }) => {
      const result = await toggleLike(id);
      if (!result.success) throw new Error(result.error);
    },
    onError: (error, { id, liked }) => {
      patchEntries((list) =>
        list.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                likedByMe: !liked,
                likeCount: liked
                  ? Math.max(0, entry.likeCount - 1)
                  : entry.likeCount + 1,
              }
            : entry,
        ),
      );
      toastError(error.message);
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

  const handleSubmit = useCallback(
    (message: string): Promise<boolean> => {
      if (!user) return Promise.resolve(false);

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

      setPages((pages) =>
        pages.map((page, index) =>
          index === 0
            ? { ...page, entries: sortEntries([tempEntry, ...page.entries]) }
            : page,
        ),
      );
      bumpTotal(1);

      return submitEntry
        .mutateAsync({ message, tempId })
        .then(() => true)
        .catch(() => false);
    },
    [user, setPages, bumpTotal, submitEntry],
  );

  const handleLike = useCallback(
    (id: number) => {
      if (!currentUserId) {
        toast.info("Sign in to like messages.");
        return;
      }
      if (id < 0 || likeGuard.current.has(id)) return;

      const entry = entries.find((e) => e.id === id);
      if (!entry) return;
      const liked = !entry.likedByMe;

      likeGuard.current.add(id);
      setPendingLikes((prev) => new Set(prev).add(id));
      patchEntries((list) =>
        list.map((e) =>
          e.id === id
            ? {
                ...e,
                likedByMe: liked,
                likeCount: liked ? e.likeCount + 1 : Math.max(0, e.likeCount - 1),
              }
            : e,
        ),
      );

      likeEntry.mutate({ id, liked });
    },
    [currentUserId, entries, patchEntries, likeEntry],
  );

  const removeEntry = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteGuestbookEntry(id);
      if (!result.success) throw new Error(result.error);
    },
    onMutate: (id) => {
      const removed = entries.find((entry) => entry.id === id);
      patchEntries((list) => list.filter((entry) => entry.id !== id));
      bumpTotal(-1);
      return { removed };
    },
    onError: (error, _id, context) => {
      if (context?.removed) {
        setPages((pages) =>
          pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  entries: sortEntries([context.removed!, ...page.entries]),
                }
              : page,
          ),
        );
        bumpTotal(1);
      }
      toastError(error.message);
    },
  });

  const handleDelete = useCallback((id: number) => {
    toast("Delete this message?", {
      action: {
        label: "Delete",
        onClick: () => removeEntry.mutate(id),
      },
      cancel: { label: "Keep", onClick: () => {} },
      duration: Infinity,
    });
  }, [removeEntry]);

  const entryVirtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 132,
    overscan: 8,
  });

  const handleLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  return (
    <Panel>
      <PanelRow className="@container py-8">
        {!isLoaded ? (
          <div
            role="status"
            className="h-12 animate-pulse bg-muted rounded"
          >
            <span className="sr-only">Loading…</span>
          </div>
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
                  <SignOutIcon data-icon="inline-start" size={14} aria-hidden="true" />
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
                  Sign in, it only takes a second.
                </TypographyMuted>
              </div>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/guestbook"
                signUpForceRedirectUrl="/guestbook"
              >
                <ButtonGroup>
                  <Button size="sm" className="gap-1.5 font-semibold shrink-0">
                    <BookOpenIcon data-icon="inline-start" size={14} aria-hidden="true" />
                    Sign in
                  </Button>
                </ButtonGroup>
              </SignInButton>
            </div>
            <EngagementNudge type="guestbook" className="pt-1 text-left" />
          </>
        )}
      </PanelRow>

      <PanelHeader label="Messages" count={count} />

      {entries.length === 0 ? (
        <PanelRow>
          <EngagementEmptyState
            title="Nobody here yet."
            description="Be the first to leave a mark. It takes 10 seconds."
          >
            <EngagementNudge type="guestbook" />
          </EngagementEmptyState>
        </PanelRow>
      ) : (
        <ScrollArea className="max-h-[60vh]" viewportRef={viewportRef}>
          <div className="max-h-[60vh]">
            <ul
              role="list"
              aria-label="Guestbook messages"
              className="relative"
              style={{ height: entryVirtualizer.getTotalSize() }}
            >
              {entryVirtualizer.getVirtualItems().map((row) => {
                const entry = entries[row.index]!;
                return (
                  <GuestbookEntry
                    key={entry.id}
                    ref={entryVirtualizer.measureElement}
                    data-index={row.index}
                    className={panelListItem}
                    style={{
                      position: "absolute",
                      insetInline: 0,
                      top: 0,
                      transform: `translateY(${row.start}px)`,
                    }}
                    entry={entry}
                    currentUserId={currentUserId}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    pendingLikes={pendingLikes}
                  />
                );
              })}
            </ul>

            {hasMore && (
              <div className="flex justify-center border-t border-line bg-background p-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  aria-busy={isFetchingNextPage}
                >
                  {isFetchingNextPage && (
                    <Spinner data-icon="inline-start" aria-hidden="true" />
                  )}
                  {loadMoreFailed && !isFetchingNextPage
                    ? "Couldn't load, retry"
                    : "Load more"}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </Panel>
  );
}
