"use client";

import type {
  MoodId,
  ReactionCounts,
} from "@/app/(site)/blog/[[...slug]]/actions";
import { ReactionMascot } from "@/components/engagement/doodles";
import {
  HeartIcon,
  SmileyMehIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
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
    activeClassName:
      "border-red-500/40 bg-red-500/10 text-red-700 hover:bg-red-500/15 hover:text-red-700 dark:text-red-400 dark:hover:text-red-400",
    inactiveClassName:
      "hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-700 dark:hover:text-red-400",
  },
  {
    id: "bad" as MoodId,
    label: "Meh",
    icon: SmileyMehIcon,
    activeClassName:
      "border-orange-500/40 bg-orange-500/10 text-orange-800 hover:bg-orange-500/15 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-400",
    inactiveClassName:
      "hover:border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-800 dark:hover:text-orange-400",
  },
  {
    id: "good" as MoodId,
    label: "Liked it",
    icon: ThumbsUpIcon,
    activeClassName:
      "border-blue-500/40 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-400",
    inactiveClassName:
      "hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-700 dark:hover:text-blue-400",
  },
  {
    id: "amazing" as MoodId,
    label: "Loved it",
    icon: HeartIcon,
    activeClassName:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-400",
    inactiveClassName:
      "hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-700 dark:hover:text-emerald-400",
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
      <fieldset
        aria-label="Rate this post"
        className="flex flex-wrap gap-2 justify-center border-0 p-0 m-0"
      >
        {MOODS.map(
          ({ id, label, icon: Icon, activeClassName, inactiveClassName }) => {
            const isActive = moodOptimistic.value === id;
            const count = moodLoading ? null : (moodOptimistic.counts[id] ?? 0);

            return (
              <Button
                key={id}
                variant="outline"
                size="sm"
                onClick={() => onSelect(id)}
                onMouseEnter={() => setHoveredMood(id)}
                onMouseLeave={() => setHoveredMood(null)}
                aria-pressed={isActive}
                aria-label={`${label}${count !== null && count > 0 ? `, ${count} reaction${count === 1 ? "" : "s"}` : ""}`}
                className={cn(
                  "gap-2 transition-[color,background-color,border-color] duration-150 cursor-pointer",
                  isActive ? activeClassName : inactiveClassName,
                )}
              >
                <Icon data-icon="inline-start" size={14} aria-hidden="true" />
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
