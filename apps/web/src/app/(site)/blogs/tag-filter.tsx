"use client";

import { CaretDownIcon, CheckIcon, TagIcon, XIcon } from "@repo/icons";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsOverflow,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@ui-sdk/react/combobox";
import { useState } from "react";

const iconButton =
  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4";

export function TagFilter({
  allTags,
  tags,
  onTagsChange,
}: {
  allTags: string[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

  return (
    <Combobox
      multiple
      items={allTags}
      value={tags}
      onValueChange={(next: string[]) => onTagsChange(next)}
      autoHighlight
    >
      <ComboboxLabel className="sr-only">Filter by tags</ComboboxLabel>
      <div
        ref={setAnchor}
        className="flex h-9 w-full min-w-0 items-center gap-1 rounded-md border border-input pr-1 pl-2.5 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30"
      >
        <TagIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <ComboboxChips className="flex min-w-0 flex-1 items-center gap-1">
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((value, index) => (
                <ComboboxChip
                  key={value}
                  value={value}
                  className="inline-flex shrink-0 items-center gap-0.5 rounded-sm bg-primary/10 py-0.5 pr-0.5 pl-1.5 font-mono text-xs text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Text as="span" variant="none">
                    {state.labels[index]}
                  </Text>
                  <ComboboxChipRemove
                    aria-label={`Remove ${state.labels[index]} filter`}
                    className="flex size-4 cursor-pointer items-center justify-center rounded-xs hover:bg-primary/20"
                  >
                    <XIcon aria-hidden="true" className="size-3" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxChipsOverflow
            render={(props, state) => (
              <span {...props} title={state.labels.join(", ")} className="tabular-nums">
                <Text as="span" variant="caption">
                  +{state.count}
                </Text>
              </span>
            )}
          />
          <ComboboxInput
            placeholder={tags.length > 0 ? "" : "Filter by tag…"}
            className="h-full w-0 min-w-4 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
          />
        </ComboboxChips>
        <ComboboxClear aria-label="Clear all tag filters" className={iconButton}>
          <XIcon aria-hidden="true" />
        </ComboboxClear>
        <ComboboxTrigger aria-label="Show tags" className={iconButton}>
          <CaretDownIcon aria-hidden="true" />
        </ComboboxTrigger>
      </div>
      <ComboboxContent
        anchor={anchor}
        sideOffset={4}
        className="w-(--anchor-width) min-w-52 max-h-[min(18rem,var(--available-height))] origin-(--transform-origin) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none"
      >
        <ComboboxEmpty className="hidden px-2 py-6 text-center data-empty:block">
          <TypographyMuted>No tags match.</TypographyMuted>
        </ComboboxEmpty>
        <ComboboxList className="flex flex-col gap-0.5">
          {(state) =>
            (state.items as string[]).map((tag) => (
              <ComboboxItem
                key={tag}
                value={tag}
                label={tag}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-semibold select-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                <ComboboxItemText className="min-w-0 flex-1 truncate [&_mark]:rounded-xs [&_mark]:bg-(--selection-bg) [&_mark]:text-(--selection-fg)" />
                <ComboboxItemIndicator className="text-primary">
                  <CheckIcon aria-hidden="true" className="size-4" />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))
          }
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
