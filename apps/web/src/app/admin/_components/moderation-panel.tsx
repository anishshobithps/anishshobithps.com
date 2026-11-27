"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryStates, parseAsString, parseAsBoolean } from "nuqs";
import NextImage from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ActionResult } from "@repo/core/action-result";
import { formatShortDate } from "@repo/core/date";
import { slugTitle } from "@repo/core/text";
import { ExpandableText } from "@repo/ui/blocks/expandable-text";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@repo/ui/components/button-group";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Input } from "@repo/ui/components/input";
import {
  Text,
  TypographyMuted,
  TypographySmall,
} from "@repo/ui/components/typography";
import {
  ArrowBendDownRightIcon,
  ChatCircleIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PushPinSimpleIcon,
  PushPinSimpleSlashIcon,
  TrashIcon,
} from "@repo/ui/icons";
import { cn } from "@repo/ui/lib/cn";
import {
  deleteComment,
  togglePinComment,
} from "@/app/(site)/blog/[[...slug]]/actions";
import {
  deleteGuestbookEntry,
  togglePinEntry,
} from "@/app/(site)/guestbook/actions";
import {
  getAllAdminComments,
  getAllAdminGuestbookEntries,
} from "@/app/admin/actions";
import { ConfirmDelete } from "@/app/admin/_components/confirm-delete";
import { queryKeys } from "@/lib/query/keys";
import { useActionMutation } from "@/lib/query/use-action-mutation";

interface ModerationRow {
  id: number;
  text: string;
  isPinned: boolean;
  isReply: boolean;
  createdAt: string | Date;
  likeCount: number;
  group: string | null;
  user: { name: string; username?: string | null; imageUrl?: string | null };
}

interface ModerationConfig {
  queryKey: readonly unknown[];
  rows: ModerationRow[];
  noun: string;
  plural: string;
  deleteNoun: string;
  emptyText: string;
  remove: (id: number) => Promise<ActionResult>;
  pin: (id: number) => Promise<ActionResult>;
}

const searchParsers = {
  q: parseAsString.withDefault(""),
  pinned: parseAsBoolean.withDefault(false),
};

const capitalize = (word: string) => word[0]!.toUpperCase() + word.slice(1);

function ModerationPanel({
  queryKey,
  rows,
  noun,
  plural,
  deleteNoun,
  emptyText,
  remove: removeAction,
  pin: pinAction,
}: ModerationConfig) {
  const [{ q, pinned }, setParams] = useQueryStates(searchParsers, {
    shallow: true,
  });

  const remove = useActionMutation({
    action: (id: number) => removeAction(id),
    successMessage: `${capitalize(noun)} deleted.`,
    invalidate: [queryKey],
  });

  const pin = useActionMutation({
    action: ({ id }: { id: number; currentlyPinned: boolean }) => pinAction(id),
    successMessage: ({ currentlyPinned }) =>
      `${capitalize(noun)} ${currentlyPinned ? "unpinned" : "pinned"}.`,
    invalidate: [queryKey],
  });

  const pendingId = remove.isPending
    ? remove.variables
    : pin.isPending
      ? pin.variables.id
      : null;

  if (rows.length === 0) {
    return (
      <Empty bordered>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ChatCircleIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Nothing here yet</EmptyTitle>
          <EmptyDescription>{emptyText}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const query = q.trim().toLowerCase();
  const filtered = rows.filter(
    (row) =>
      (!pinned || row.isPinned) &&
      (!query ||
        row.text.toLowerCase().includes(query) ||
        row.user.name.toLowerCase().includes(query) ||
        (row.user.username?.toLowerCase().includes(query) ?? false)),
  );

  const grouped = Object.groupBy(filtered, (row) => row.group ?? "");
  const groups = Object.keys(grouped)
    .sort()
    .map((group) => ({ group, items: grouped[group] ?? [] }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            autoComplete="off"
            aria-label={`Search ${plural}, names…`}
            placeholder={`Search ${plural}, names…`}
            value={q}
            onChange={(e) => setParams({ q: e.target.value })}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Button
          variant={pinned ? "secondary" : "outline"}
          size="sm"
          onClick={() => setParams({ pinned: !pinned })}
          className="shrink-0 h-8 text-xs"
        >
          <PushPinSimpleIcon
            data-icon="inline-start"
            className="size-3"
            weight={pinned ? "fill" : "regular"}
          />
          Pinned only
        </Button>
      </div>

      <TypographyMuted role="status" aria-live="polite" className="sr-only">
        {pendingId !== null
          ? `Updating ${noun}…`
          : `${filtered.length} ${filtered.length === 1 ? noun : plural} shown.`}
      </TypographyMuted>

      {filtered.length === 0 && (
        <Empty bordered>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifyingGlassIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No {plural} match your filters</EmptyTitle>
            <EmptyDescription>
              Try a different search term, or drop the pinned-only filter.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setParams({ q: "", pinned: false })}
            >
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      )}

      <div className="flex flex-col gap-8">
        {groups.map(({ group, items }) => (
          <div key={group} className="flex flex-col">
            {group && (
              <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                <Text variant="title" as="h2" className="min-w-0 truncate">
                  <Link
                    href={group as Route}
                    target="_blank"
                    className="hover:underline underline-offset-2"
                    title={group}
                  >
                    {slugTitle(group)}
                  </Link>
                </Text>
                <TypographyMuted className="text-xs shrink-0">
                  {items.length} {items.length === 1 ? noun : plural}
                </TypographyMuted>
              </div>
            )}

            <div className="flex flex-col divide-y divide-border border rounded-lg overflow-hidden">
              {items.map((row) => (
                <div
                  key={row.id}
                  className={cn(
                    "flex items-start gap-3 p-3",
                    row.isPinned && "bg-accent/30",
                    row.isReply && "pl-9",
                  )}
                >
                  {row.isReply && (
                    <ArrowBendDownRightIcon
                      aria-hidden="true"
                      className="size-3.5 mt-1 text-muted-foreground shrink-0 -ml-6"
                    />
                  )}
                  {row.user.imageUrl ? (
                    <NextImage
                      src={row.user.imageUrl}
                      alt={row.user.name}
                      width={28}
                      height={28}
                      unoptimized
                      className="size-7 rounded-full shrink-0 object-cover"
                    />
                  ) : (
                    <div className="size-7 rounded-full shrink-0 bg-muted" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <TypographySmall
                        className="min-w-0 max-w-full truncate font-medium"
                        title={row.user.name}
                      >
                        {row.user.name}
                      </TypographySmall>
                      {row.user.username && (
                        <TypographyMuted
                          className="min-w-0 max-w-full truncate text-xs"
                          title={`@${row.user.username}`}
                        >
                          @{row.user.username}
                        </TypographyMuted>
                      )}
                      {row.isPinned && (
                        <Badge variant="secondary">
                          <PushPinSimpleIcon className="size-3" weight="fill" />
                          Pinned
                        </Badge>
                      )}
                      {row.isReply && <Badge variant="outline">Reply</Badge>}
                      <TypographyMuted className="ml-auto shrink-0 text-xs tabular-nums">
                        {formatShortDate(row.createdAt)}
                      </TypographyMuted>
                    </div>
                    <ExpandableText>{row.text}</ExpandableText>
                    <TypographyMuted
                      as="span"
                      aria-label={`${row.likeCount} like${row.likeCount !== 1 ? "s" : ""}`}
                      className="flex items-center gap-1 text-xs mt-1.5"
                    >
                      <HeartIcon aria-hidden="true" className="size-3" weight="fill" />
                      {row.likeCount}
                    </TypographyMuted>
                  </div>

                  <ButtonGroup className="shrink-0">
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      disabled={pendingId === row.id}
                      onClick={() => {
                        if (pendingId === null) {
                          pin.mutate({ id: row.id, currentlyPinned: row.isPinned });
                        }
                      }}
                      aria-label={`${row.isPinned ? "Unpin" : "Pin"} ${noun}`}
                    >
                      {row.isPinned ? (
                        <PushPinSimpleSlashIcon className="size-4" />
                      ) : (
                        <PushPinSimpleIcon className="size-4" />
                      )}
                    </Button>
                    <ButtonGroupSeparator />
                    <ConfirmDelete
                      compact
                      trigger={
                        <Button
                          variant="destructive-soft"
                          size="icon-sm"
                          disabled={pendingId !== null}
                          aria-label={`Delete ${noun} by ${row.user.name}`}
                        >
                          <TrashIcon className="size-4" />
                        </Button>
                      }
                      title={`Delete ${noun}?`}
                      description={
                        <>
                          This {noun} by{" "}
                          <span className="font-medium text-foreground">
                            {row.user.name}
                          </span>{" "}
                          will be permanently removed and cannot be recovered.
                        </>
                      }
                      confirm={`Permanently deletes the ${deleteNoun} by ${row.user.name}`}
                      onConfirm={() => {
                        if (pendingId === null) remove.mutate(row.id);
                      }}
                    />
                  </ButtonGroup>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CommentsPanel() {
  const { data = [] } = useQuery({
    queryKey: queryKeys.admin.comments,
    queryFn: getAllAdminComments,
  });
  return (
    <ModerationPanel
      queryKey={queryKeys.admin.comments}
      rows={data.map((comment) => ({
        id: comment.id,
        text: comment.body,
        isPinned: comment.isPinned,
        isReply: comment.parentId !== null,
        createdAt: comment.createdAt,
        likeCount: comment.likeCount,
        group: comment.postSlug,
        user: comment.user,
      }))}
      noun="comment"
      plural="comments"
      deleteNoun="comment"
      emptyText="Comments left on blog posts show up here once readers start writing."
      remove={deleteComment}
      pin={togglePinComment}
    />
  );
}

export function GuestbookPanel() {
  const { data = [] } = useQuery({
    queryKey: queryKeys.admin.guestbook,
    queryFn: getAllAdminGuestbookEntries,
  });
  return (
    <ModerationPanel
      queryKey={queryKeys.admin.guestbook}
      rows={data.map((entry) => ({
        id: entry.id,
        text: entry.message,
        isPinned: entry.isPinned,
        isReply: false,
        createdAt: entry.createdAt,
        likeCount: entry.likeCount,
        group: null,
        user: entry.user,
      }))}
      noun="entry"
      plural="entries"
      deleteNoun="guestbook entry"
      emptyText="Guestbook entries show up here once visitors start signing it."
      remove={deleteGuestbookEntry}
      pin={togglePinEntry}
    />
  );
}
