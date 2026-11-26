"use client";

import { CheckIcon, PlusIcon, XIcon } from "@repo/icons";
import { PROJECT_LIMITS } from "@repo/core/projects-schema";
import { FormLabel, useFormField } from "@repo/ui/components/form";
import { Text } from "@repo/ui/components/typography";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox";
import { useMemo, useState } from "react";

export function HighlightsField({
  value,
  onChange,
  suggestions,
  disabled,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions: string[];
  disabled?: boolean;
}) {
  const { error, formMessageId } = useFormField();
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const items = useMemo(
    () =>
      [...new Set([...suggestions, ...value])].sort((a, b) =>
        a.localeCompare(b),
      ),
    [suggestions, value],
  );

  return (
    <Combobox
      multiple
      items={items}
      value={value}
      onValueChange={(next: string[]) => onChange(next)}
      maxSelected={PROJECT_LIMITS.highlights}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxLabel render={<FormLabel />}>Tech highlights</ComboboxLabel>
      <div
        ref={setAnchor}
        className="flex min-h-9 w-full min-w-0 flex-wrap items-center gap-1 rounded-md border border-input px-2 py-1 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 has-data-disabled:opacity-50 dark:bg-input/30"
      >
        <ComboboxChips className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((highlight) => (
                <ComboboxChip
                  key={highlight}
                  value={highlight}
                  className="inline-flex max-w-full items-center gap-0.5 rounded-sm bg-secondary py-0.5 pr-0.5 pl-1.5 text-xs text-secondary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 truncate">
                    <Text as="span" variant="none">
                      {highlight}
                    </Text>
                  </span>
                  <ComboboxChipRemove
                    aria-label={`Remove ${highlight}`}
                    className="flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs hover:bg-accent"
                  >
                    <XIcon aria-hidden="true" className="size-3" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput
            placeholder={value.length > 0 ? "" : "TypeScript, React, Bun…"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? formMessageId : undefined}
            className="h-7 w-0 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </ComboboxChips>
      </div>
      <ComboboxContent
        anchor={anchor}
        sideOffset={4}
        className="w-(--anchor-width) max-h-[min(16rem,var(--available-height))] origin-(--transform-origin) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        <ComboboxEmpty className="hidden px-2 py-1.5 data-empty:block">
          <Text variant="caption">Type to add a highlight.</Text>
        </ComboboxEmpty>
        <ComboboxList className="flex flex-col gap-0.5">
          {(state) => (
            <>
              {(state.items as string[]).map((highlight) => (
                <ComboboxItem
                  key={highlight}
                  value={highlight}
                  label={highlight}
                  className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <ComboboxItemText className="min-w-0 flex-1 truncate [&_mark]:rounded-xs [&_mark]:bg-(--selection-bg) [&_mark]:text-(--selection-fg)" />
                  <ComboboxItemIndicator>
                    <CheckIcon aria-hidden="true" className="size-4" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
              <ComboboxCreate
                minLength={1}
                onCreate={(query) => {
                  const highlight = query.trim();
                  if (highlight && !value.includes(highlight)) {
                    onChange([...value, highlight]);
                  }
                }}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                {(state) => (
                  <>
                    <PlusIcon aria-hidden="true" className="size-4" />
                    <span className="min-w-0 truncate">
                      <Text as="span" variant="none">
                        Add “{state.query.trim()}”
                      </Text>
                    </span>
                  </>
                )}
              </ComboboxCreate>
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
