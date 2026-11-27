"use client";

import { HeartIcon } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import { Spinner } from "@repo/ui/components/spinner";
import { Toggle } from "@ui-sdk/react/toggle";

export function LikeToggle({
  count,
  liked,
  pending = false,
  onToggle,
}: {
  count: number;
  liked: boolean;
  pending?: boolean;
  onToggle: () => void;
}) {
  return (
    <Toggle
      pressed={liked}
      onPressedChange={() => onToggle()}
      disabled={pending}
      aria-busy={pending || undefined}
      aria-label={`Like (${count})`}
      render={(props, state) => (
        <Button
          {...props}
          variant={state.pressed ? "default" : "outline"}
          size="sm"
        />
      )}
    >
      {pending ? (
        <Spinner data-icon="inline-start" className="size-3.5" aria-hidden="true" />
      ) : (
        <HeartIcon
          data-icon="inline-start"
          size={14}
          weight={liked ? "fill" : "duotone"}
          aria-hidden="true"
        />
      )}
      {count > 0 ? (
        <span className="tabular-nums">{count}</span>
      ) : (
        <span className="hidden sm:inline">Like</span>
      )}
    </Toggle>
  );
}
