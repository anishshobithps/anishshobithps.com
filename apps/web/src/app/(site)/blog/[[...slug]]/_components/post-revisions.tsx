"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  BookOpenIcon,
  GitCommitIcon,
  PlusIcon,
  WarningIcon,
} from "@repo/ui/icons";
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
import { createStoredValue, type Store } from "@repo/core/store";
import type { PostUpdateKind } from "@/lib/post-updates";
import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline";

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

interface RevisionRun {
  kind: PostUpdateKind;
  notes: string[];
}

interface RevisionGroup {
  day: string;
  runs: RevisionRun[];
}

function RevisionMarker({ active = false }: { active?: boolean }) {
  return (
    <>
      <TimelineMarker className="col-start-1 row-start-1 flex h-5 items-center justify-center">
        <span
          className={cn(
            "relative z-10 flex size-4 items-center justify-center rounded-full border bg-popover",
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
      </TimelineMarker>
      <TimelineConnector className="absolute top-2.5 bottom-0 left-2 w-px -translate-x-1/2 bg-border group-last/event:hidden group-data-last/event:hidden" />
    </>
  );
}

const eventClassName =
  "group/event relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3 rounded-sm pb-5 outline-none last:pb-0 focus-visible:ring-3 focus-visible:ring-ring/50";

const seenStores = new Map<string, Store<string | null>>();

function seenRevision(slug: string) {
  let store = seenStores.get(slug);
  if (!store) {
    store = createStoredValue<string | null>({
      key: `revision-seen:${slug}`,
      fallback: null,
      parse: (raw) => raw,
      serialize: (day) => day,
    });
    seenStores.set(slug, store);
  }
  return store;
}

export function PostRevisions({
  slug,
  entries,
  publishedDay,
}: PostRevisionsProps) {
  const store = seenRevision(slug);
  const seen = useSyncExternalStore(store.subscribe, store.get, store.getServer);
  const latest = entries[0]?.day;

  useEffect(() => {
    if (latest && store.get() === null) store.set(latest);
  }, [latest, store]);

  if (!latest) return null;

  const isNew = (day: string) => seen !== null && day > seen;
  const unseen = entries.filter((entry) => isNew(entry.day)).length;
  const groups = entries.reduce<RevisionGroup[]>((acc, entry) => {
    let group = acc.find((g) => g.day === entry.day);
    if (!group) {
      group = { day: entry.day, runs: [] };
      acc.push(group);
    }
    const run = group.runs.at(-1);
    if (run?.kind === entry.kind) run.notes.push(entry.note);
    else group.runs.push({ kind: entry.kind, notes: [entry.note] });
    return acc;
  }, []);

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) store.set(latest);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="muted" size="inline">
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
        <Timeline aria-label="Revision log" className="mt-4 flex flex-col tabular-nums">
          {groups.map((group) => {
            const fresh = isNew(group.day);

            return (
              <TimelineItem key={group.day} className={eventClassName}>
                <RevisionMarker active={fresh} />
                <div className="col-start-2 flex h-5 items-center gap-2">
                  <TimelineTitle render={<Text variant="title" as="span" />}>
                    <time dateTime={group.day}>
                      {formatShortDate(group.day)}
                    </time>
                  </TimelineTitle>
                  {fresh && <Badge variant="default">New for you</Badge>}
                </div>
                <TimelineDescription
                  render={<div />}
                  className="col-start-2 mt-3"
                >
                  <ul role="list" className="flex flex-col gap-3">
                    {group.runs.map((run, runIndex) => {
                      const { label, Icon } = KINDS[run.kind];

                      return (
                        <li key={runIndex} className="flex gap-2">
                          <Icon
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                          />
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <Text variant="title" as="span">
                              {label}
                            </Text>
                            <div className="flex flex-col gap-1.5">
                              {run.notes.map((note, noteIndex) => (
                                <Text key={noteIndex} variant="muted" as="p">
                                  {note}
                                </Text>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </TimelineDescription>
              </TimelineItem>
            );
          })}
          {publishedDay && (
            <TimelineItem className={eventClassName}>
              <RevisionMarker />
              <div className="col-start-2 flex h-5 items-center gap-2">
                <TimelineTitle render={<Text variant="title" as="span" />}>
                  Published
                </TimelineTitle>
                <TimelineTime
                  dateTime={publishedDay}
                  render={<Text variant="caption" as="time" />}
                >
                  {formatShortDate(publishedDay)}
                </TimelineTime>
              </div>
            </TimelineItem>
          )}
        </Timeline>
      </PopoverContent>
    </Popover>
  );
}
