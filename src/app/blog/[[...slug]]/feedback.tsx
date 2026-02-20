"use client";

import { cn } from "@/lib/cn";
import { ThumbsDown, Meh, ThumbsUp, Heart } from "lucide-react";
import { useState, useOptimistic, startTransition, useEffect } from "react";
import {
  getReactions,
  submitReaction,
  type MoodId,
  type ReactionCounts,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypographyP } from "@/components/ui/typography";

interface OptimisticAction {
  newMood: MoodId | "";
  prevMood: MoodId | "";
}

interface OptimisticState {
  value: MoodId | "";
  counts: ReactionCounts;
}

interface BlogReactionsProps {
  slug: string;
  className?: string;
}

const MOODS = [
  {
    id: "terrible" as MoodId,
    label: "Not for me",
    icon: ThumbsDown,
    activeClassName:
      "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/15 hover:text-red-400",
    inactiveClassName:
      "hover:border-red-500/20 hover:bg-red-500/5 hover:text-red-400",
    badgeClassName:
      "bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/15",
  },
  {
    id: "bad" as MoodId,
    label: "Meh",
    icon: Meh,
    activeClassName:
      "border-orange-500/40 bg-orange-500/10 text-orange-400 hover:bg-orange-500/15 hover:text-orange-400",
    inactiveClassName:
      "hover:border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-400",
    badgeClassName:
      "bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/15",
  },
  {
    id: "good" as MoodId,
    label: "Liked it",
    icon: ThumbsUp,
    activeClassName:
      "border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15 hover:text-blue-400",
    inactiveClassName:
      "hover:border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-400",
    badgeClassName:
      "bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/15",
  },
  {
    id: "amazing" as MoodId,
    label: "Loved it",
    icon: Heart,
    activeClassName:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-400",
    inactiveClassName:
      "hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-400",
    badgeClassName:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15",
  },
] as const;

export function BlogReactions({ slug, className }: BlogReactionsProps) {
  function optimisticReducer(
    state: OptimisticState,
    { newMood, prevMood }: OptimisticAction,
  ): OptimisticState {
    const nextCounts = { ...state.counts };
    if (prevMood)
      nextCounts[prevMood] = Math.max(0, (nextCounts[prevMood] ?? 0) - 1);
    if (newMood) nextCounts[newMood] = (nextCounts[newMood] ?? 0) + 1;
    return { value: newMood, counts: nextCounts };
  }

  const [value, setValue] = useState<MoodId | "">("");
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [loading, setLoading] = useState(true);

  const [optimistic, addOptimistic] = useOptimistic<
    OptimisticState,
    OptimisticAction
  >({ value, counts }, optimisticReducer);

  useEffect(() => {
    getReactions(slug)
      .then(({ counts: c, userMood }) => {
        setCounts(c);
        setValue(userMood ?? "");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSelect = (id: MoodId) => {
    const newMood: MoodId | "" = optimistic.value === id ? "" : id;
    const prevMood: MoodId | "" = optimistic.value;

    startTransition(async () => {
      addOptimistic({ newMood, prevMood });
      setValue(newMood);
      setCounts((prev) => {
        const next = { ...prev };
        if (prevMood) next[prevMood] = Math.max(0, (next[prevMood] ?? 0) - 1);
        if (newMood) next[newMood] = (next[newMood] ?? 0) + 1;
        return next;
      });
      await submitReaction(slug, newMood || null);
    });
  };

  return (
    <div className={cn("w-full ", className)}>
      <TypographyP className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center">
        How was this read?
      </TypographyP>

      {/* Hide emoji reactions on mobile, show on md and up */}
      <div className="flex flex-wrap gap-2 justify-center">
        {MOODS.map(
          ({
            id,
            icon: Icon,
            label,
            activeClassName,
            inactiveClassName,
            badgeClassName,
          }) => {
            const isActive = optimistic.value === id;
            const count = loading ? null : (optimistic.counts[id] ?? 0);

            return (
              <Button
                key={id}
                variant="outline"
                size="sm"
                onClick={() => handleSelect(id)}
                className={cn(
                  "gap-2 transition-all duration-150 cursor-pointer",
                  isActive ? activeClassName : inactiveClassName,
                )}
              >
                <Icon size={14} strokeWidth={isActive ? 2.5 : 2} />
                <span className="hidden md:inline">{label}</span>
                {count !== null && count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-1.5 py-0 text-[11px] font-semibold",
                      badgeClassName,
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          },
        )}
      </div>
    </div>
  );
}
