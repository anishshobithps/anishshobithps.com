"use client";

import { useEffect } from "react";
import {
  BookOpenIcon,
  GitCommitIcon,
  PlusIcon,
  WarningIcon,
} from "@repo/icons";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import { formatShortDate } from "@repo/core/date";
import {
  markRevisionSeen,
  readRevisionSeen,
  useSeenRevision,
} from "@/lib/revision-seen";
import type { PostUpdateKind } from "@/lib/post-updates";

interface RevisionEntry {
  day: string;
  kind: PostUpdateKind;
  note: string;
}

interface PostRevisionsProps {
  slug: string;
  entries: RevisionEntry[];
  publishedDay?: string;
}

const KINDS = {
  correction: { label: "Correction", Icon: WarningIcon },
  addition: { label: "Added", Icon: PlusIcon },
  sources: { label: "Sources", Icon: BookOpenIcon },
  edit: { label: "Edited", Icon: GitCommitIcon },
} as const;

function TimelineDot({ active = false }: { active?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border bg-popover",
        active && "border-primary",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground",
        )}
      />
    </span>
  );
}

export function PostRevisions({
  slug,
  entries,
  publishedDay,
}: PostRevisionsProps) {
  const seen = useSeenRevision(slug);
  const latest = entries[0]?.day;

  useEffect(() => {
    if (latest && readRevisionSeen(slug) === null) {
      markRevisionSeen(slug, latest);
    }
  }, [latest, slug]);

  if (!latest) return null;

  const isNew = (day: string) => seen !== null && day > seen;
  const unseen = entries.filter((entry) => isNew(entry.day)).length;
  const groups = entries.reduce<{ day: string; items: RevisionEntry[] }[]>(
    (acc, entry) => {
      const group = acc.find((g) => g.day === entry.day);
      if (group) group.items.push(entry);
      else acc.push({ day: entry.day, items: [entry] });
      return acc;
    },
    [],
  );

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) markRevisionSeen(slug, latest);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="muted" size="xs" className="-ml-1.5">
          <GitCommitIcon className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="tabular-nums">
            Revised{" "}
            <time dateTime={latest}>{formatShortDate(latest)}</time>
          </span>
          {unseen > 0 && (
            <span className="relative flex size-2" role="status">
              <span
                aria-hidden="true"
                className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60 motion-reduce:animate-none"
              />
              <span
                aria-hidden="true"
                className="relative inline-flex size-2 rounded-full bg-primary"
              />
              <span className="sr-only">
                {unseen} {unseen === 1 ? "change" : "changes"} since your last
                visit
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="max-h-96 w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
      >
        <div className="flex items-baseline justify-between gap-3">
          <Text variant="title" as="h2">
            Revision log
          </Text>
          <Text variant="caption" as="span">
            {entries.length} {entries.length === 1 ? "change" : "changes"}
          </Text>
        </div>
        <ol role="list" className="mt-4 flex flex-col tabular-nums">
          {groups.map((group, index) => {
            const fresh = isNew(group.day);
            const last = index === groups.length - 1 && !publishedDay;

            return (
              <li
                key={group.day}
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {!last && (
                  <span
                    aria-hidden="true"
                    className="absolute top-4 -bottom-0.5 left-2 w-px -translate-x-1/2 bg-border"
                  />
                )}
                <TimelineDot active={fresh} />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Text variant="title" as="span">
                      <time dateTime={group.day}>
                        {formatShortDate(group.day)}
                      </time>
                    </Text>
                    {fresh && <Badge variant="default">New for you</Badge>}
                  </div>
                  <ul role="list" className="flex flex-col gap-3">
                    {group.items.map((item, itemIndex) => {
                      const { label, Icon } = KINDS[item.kind];
                      const startsRun =
                        itemIndex === 0 ||
                        group.items[itemIndex - 1].kind !== item.kind;

                      return (
                        <li
                          key={itemIndex}
                          className={cn("flex gap-2", !startsRun && "-mt-1.5")}
                        >
                          {startsRun ? (
                            <Icon
                              aria-hidden="true"
                              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                            />
                          ) : (
                            <span aria-hidden="true" className="size-3.5 shrink-0" />
                          )}
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            {startsRun ? (
                              <Text variant="title" as="span">
                                {label}
                              </Text>
                            ) : (
                              <span className="sr-only">{label}</span>
                            )}
                            <Text variant="muted" as="p">
                              {item.note}
                            </Text>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
          {publishedDay && (
            <li className="relative flex gap-3">
              <TimelineDot />
              <div className="flex items-center gap-2">
                <Text variant="title" as="span">
                  Published
                </Text>
                <Text variant="caption" as="span">
                  <time dateTime={publishedDay}>
                    {formatShortDate(publishedDay)}
                  </time>
                </Text>
              </div>
            </li>
          )}
        </ol>
      </PopoverContent>
    </Popover>
  );
}
