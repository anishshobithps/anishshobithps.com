"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useTransition } from "react";
import { Spinner } from "@repo/ui/components/spinner";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/admin-analytics/range";

const RANGE_KEYS = RANGE_OPTIONS.map((option) => option.key);

export function RangePicker() {
  const [pending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGE_KEYS)
      .withDefault("30d")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <div className="flex items-center gap-2">
      {pending && <Spinner aria-label="Loading range" />}
      <SegmentedControl
        value={range}
        onValueChange={(value) => {
          if (value) void setRange(value as RangeKey);
        }}
        aria-label="Date range"
        className="relative isolate inline-flex h-8 items-center rounded-md border border-input p-0.5 shadow-xs dark:bg-input/30"
      >
        <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-sm bg-accent transition-[left,width] duration-200 ease-out motion-reduce:transition-none" />
        {RANGE_OPTIONS.map((option) => (
          <SegmentedControlItem
            key={option.key}
            value={option.key}
            aria-label={`Last ${option.label}`}
            className="h-full cursor-pointer rounded-sm px-3 font-mono text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:text-accent-foreground"
          >
            {option.key}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}
