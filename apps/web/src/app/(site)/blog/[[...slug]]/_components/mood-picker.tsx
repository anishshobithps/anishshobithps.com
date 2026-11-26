"use client";

import type {
  MoodId,
  ReactionCounts,
} from "@/app/(site)/blog/[[...slug]]/actions";
import { ReactionMascot } from "@/components/shared/doodles";
import {
  HeartIcon,
  SmileyMehIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@repo/icons";
import { Button } from "@repo/ui/components/button";
import {
  Text,
  TypographyMuted,
  TypographySmall,
} from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import { Toggle, ToggleGroup, ToggleIcon } from "@ui-sdk/react/toggle";
import { useState } from "react";

export interface MoodState {
  value: MoodId | "";
  counts: ReactionCounts;
}

const MOODS = [
  {
    id: "terrible" as MoodId,
    label: "Not for me",
    icon: ThumbsDownIcon,
    toneClassName:
      "hover:border-destructive/30 hover:bg-destructive/5 data-pressed:border-destructive/60 data-pressed:bg-destructive/15 dark:hover:border-destructive/30 dark:hover:bg-destructive/5 dark:data-pressed:border-destructive/60 dark:data-pressed:bg-destructive/15",
  },
  {
    id: "bad" as MoodId,
    label: "Meh",
    icon: SmileyMehIcon,
    toneClassName:
      "hover:border-warning/30 hover:bg-warning/5 data-pressed:border-warning/60 data-pressed:bg-warning/15 dark:hover:border-warning/30 dark:hover:bg-warning/5 dark:data-pressed:border-warning/60 dark:data-pressed:bg-warning/15",
  },
  {
    id: "good" as MoodId,
    label: "Liked it",
    icon: ThumbsUpIcon,
    toneClassName:
      "hover:border-(--color-available)/30 hover:bg-(--color-available)/5 data-pressed:border-(--color-available)/60 data-pressed:bg-(--color-available)/15 dark:hover:border-(--color-available)/30 dark:hover:bg-(--color-available)/5 dark:data-pressed:border-(--color-available)/60 dark:data-pressed:bg-(--color-available)/15",
  },
  {
    id: "amazing" as MoodId,
    label: "Loved it",
    icon: HeartIcon,
    toneClassName:
      "hover:border-(--color-heart)/30 hover:bg-(--color-heart)/5 data-pressed:border-(--color-heart)/60 data-pressed:bg-(--color-heart)/15 dark:hover:border-(--color-heart)/30 dark:hover:bg-(--color-heart)/5 dark:data-pressed:border-(--color-heart)/60 dark:data-pressed:bg-(--color-heart)/15",
  },
] as const;

export interface MoodPickerProps {
  moodOptimistic: MoodState;
  moodLoading: boolean;
  onSelect: (id: MoodId) => void;
}

export function MoodPicker({
  moodOptimistic,
  moodLoading,
  onSelect,
}: MoodPickerProps) {
  const [hoveredMood, setHoveredMood] = useState<MoodId | null>(null);
  const displayMood = hoveredMood ?? moodOptimistic.value;
  const total = Object.values(moodOptimistic.counts).reduce(
    (sum, count) => sum + (count ?? 0),
    0,
  );

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <ReactionMascot mood={moodLoading ? "" : displayMood} />
        <div className="space-y-1.5">
          <TypographySmall as="p" className="font-semibold">
            What did you think?
          </TypographySmall>
          <TypographyMuted className="text-xs">
            One tap. No account needed.
          </TypographyMuted>
        </div>
      </div>
      <ToggleGroup
        aria-label="Rate this post"
        value={moodOptimistic.value ? [moodOptimistic.value] : []}
        onValueChange={(next: string[]) => {
          const picked = (next[0] as MoodId | undefined) ?? moodOptimistic.value;
          if (picked) onSelect(picked);
        }}
        className="flex flex-wrap justify-center gap-2"
      >
        {MOODS.map(({ id, label, icon: Icon, toneClassName }) => {
          const count = moodLoading ? null : (moodOptimistic.counts[id] ?? 0);

          return (
            <Toggle
              key={id}
              value={id}
              render={<Button variant="outline" size="sm" />}
              onMouseEnter={() => setHoveredMood(id)}
              onMouseLeave={() => setHoveredMood(null)}
              aria-label={`${label}${count !== null && count > 0 ? `, ${count} reaction${count === 1 ? "" : "s"}` : ""}`}
              className={cn(
                "cursor-pointer gap-2 transition-[color,background-color,border-color] duration-150",
                toneClassName,
              )}
            >
              <ToggleIcon>
                <Icon size={14} />
              </ToggleIcon>
              {label}
              {count !== null && count > 0 && (
                <span className="tabular-nums">
                  <Text as="span" variant="caption">
                    {count}
                  </Text>
                </span>
              )}
            </Toggle>
          );
        })}
      </ToggleGroup>
      {!moodLoading && (
        <TypographyMuted className="text-xs tabular-nums">
          {total === 0
            ? "Nobody's voted yet. Be the first."
            : `${total} ${total === 1 ? "reaction" : "reactions"} so far`}
        </TypographyMuted>
      )}
    </div>
  );
}
