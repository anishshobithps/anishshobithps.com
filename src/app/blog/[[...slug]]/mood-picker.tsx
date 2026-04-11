"use client";

import type { MoodId, ReactionCounts } from "@/app/blog/[[...slug]]/actions";
import {
  HeartIcon,
  SmileyMehIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "@/components/ui/typography";
import { cn } from "@/lib/cn";

export interface MoodState {
  value: MoodId | "";
  counts: ReactionCounts;
}

export const MOODS = [
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
  return (
    <div className="space-y-3" aria-label="How was this read?">
      <TypographyMuted className="text-xs font-semibold uppercase tracking-widest text-center">
        How was this read?
      </TypographyMuted>
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
  );
}
