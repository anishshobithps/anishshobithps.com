"use client";

import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Spinner } from "@repo/ui/components/spinner";
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
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={range}
        onValueChange={(value) => {
          if (value) void setRange(value as RangeKey);
        }}
        aria-label="Date range"
      >
        {RANGE_OPTIONS.map((option) => (
          <ToggleGroupItem
            key={option.key}
            value={option.key}
            aria-label={`Last ${option.label}`}
            className="px-3 font-mono text-xs"
          >
            {option.key}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
