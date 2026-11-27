"use client";

import { CaretDownIcon, CheckIcon, PlusIcon, XIcon } from "@repo/ui/icons";
import { Text } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsOverflow,
  ComboboxClear,
  ComboboxContent,
  ComboboxCreate,
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
import { type ReactElement, type ReactNode, useState } from "react";

const iconButton =
  "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4";

const tones = {
  brand: {
    chip: "shrink-0 bg-primary/10 font-mono text-primary",
    remove: "hover:bg-primary/20",
    item: "font-semibold",
    indicator: "text-primary",
  },
  neutral: {
    chip: "max-w-full bg-secondary text-secondary-foreground",
    remove: "shrink-0 hover:bg-accent",
    item: "",
    indicator: "",
  },
};

const option =
  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground";

export function ChipsCombobox({
  label,
  labelRender,
  hideLabel = false,
  items,
  value,
  onValueChange,
  placeholder,
  emptyText,
  layout = "wrap",
  tone = "neutral",
  icon,
  removeLabel = (item) => `Remove ${item}`,
  clearLabel,
  triggerLabel,
  onCreate,
  createLabel = (query) => `Add “${query}”`,
  maxSelected,
  disabled,
  inputProps,
}: {
  label: string;
  labelRender?: ReactElement;
  hideLabel?: boolean;
  items: string[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder: string;
  emptyText: string;
  layout?: "line" | "wrap";
  tone?: keyof typeof tones;
  icon?: ReactNode;
  removeLabel?: (item: string) => string;
  clearLabel?: string;
  triggerLabel?: string;
  onCreate?: (query: string) => void;
  createLabel?: (query: string) => string;
  maxSelected?: number;
  disabled?: boolean;
  inputProps?: { "aria-invalid"?: boolean; "aria-describedby"?: string };
}) {
  const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);
  const line = layout === "line";
  const styles = tones[tone];

  return (
    <Combobox
      multiple
      items={items}
      value={value}
      onValueChange={(next: string[]) => onValueChange(next)}
      maxSelected={maxSelected}
      disabled={disabled}
      autoHighlight
    >
      <ComboboxLabel
        render={labelRender}
        className={hideLabel ? "sr-only" : undefined}
      >
        {label}
      </ComboboxLabel>
      <div
        ref={setAnchor}
        className={cn(
          "flex w-full min-w-0 items-center gap-1 rounded-md border border-input shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 has-data-disabled:opacity-50 dark:bg-input/30",
          line ? "h-9 pr-1 pl-2.5" : "min-h-9 flex-wrap px-2 py-1",
        )}
      >
        {icon}
        <ComboboxChips
          className={cn(
            "flex min-w-0 flex-1 items-center gap-1",
            !line && "flex-wrap",
          )}
        >
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((item, index) => (
                <ComboboxChip
                  key={item}
                  value={item}
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-sm py-0.5 pr-0.5 pl-1.5 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    styles.chip,
                  )}
                >
                  <span className="min-w-0 truncate">
                    <Text as="span" variant="none">
                      {state.labels[index]}
                    </Text>
                  </span>
                  <ComboboxChipRemove
                    aria-label={removeLabel(state.labels[index] ?? item)}
                    className={cn(
                      "flex size-4 cursor-pointer items-center justify-center rounded-xs",
                      styles.remove,
                    )}
                  >
                    <XIcon aria-hidden="true" className="size-3" />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          {line && (
            <ComboboxChipsOverflow
              render={(props, state) => (
                <span
                  {...props}
                  title={state.labels.join(", ")}
                  className="tabular-nums"
                >
                  <Text as="span" variant="caption">
                    +{state.count}
                  </Text>
                </span>
              )}
            />
          )}
          <ComboboxInput
            placeholder={value.length > 0 ? "" : placeholder}
            {...inputProps}
            className={cn(
              "w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground",
              line ? "h-full min-w-4" : "h-7 min-w-24",
              styles.item,
            )}
          />
        </ComboboxChips>
        {clearLabel && (
          <ComboboxClear aria-label={clearLabel} className={iconButton}>
            <XIcon aria-hidden="true" />
          </ComboboxClear>
        )}
        {triggerLabel && (
          <ComboboxTrigger aria-label={triggerLabel} className={iconButton}>
            <CaretDownIcon aria-hidden="true" />
          </ComboboxTrigger>
        )}
      </div>
      <ComboboxContent
        anchor={anchor}
        sideOffset={4}
        className={cn(
          "w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none",
          line
            ? "max-h-[min(18rem,var(--available-height))] min-w-52"
            : "max-h-[min(16rem,var(--available-height))]",
        )}
      >
        <ComboboxEmpty
          className={cn(
            "hidden text-center data-empty:block",
            line ? "px-2 py-6" : "px-2 py-1.5",
          )}
        >
          <Text variant="caption">{emptyText}</Text>
        </ComboboxEmpty>
        <ComboboxList className="flex flex-col gap-0.5">
          {(state) => (
            <>
              {(state.items as string[]).map((item) => (
                <ComboboxItem
                  key={item}
                  value={item}
                  label={item}
                  className={cn(
                    option,
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                    styles.item,
                  )}
                >
                  <ComboboxItemText className="min-w-0 flex-1 truncate [&_mark]:rounded-xs [&_mark]:bg-(--selection-bg) [&_mark]:text-(--selection-fg)" />
                  <ComboboxItemIndicator className={styles.indicator}>
                    <CheckIcon aria-hidden="true" className="size-4" />
                  </ComboboxItemIndicator>
                </ComboboxItem>
              ))}
              {onCreate && (
                <ComboboxCreate
                  minLength={1}
                  onCreate={(query) => {
                    const created = query.trim();
                    if (created && !value.includes(created)) onCreate(created);
                  }}
                  className={option}
                >
                  {(state) => (
                    <>
                      <PlusIcon aria-hidden="true" className="size-4" />
                      <span className="min-w-0 truncate">
                        <Text as="span" variant="none">
                          {createLabel(state.query.trim())}
                        </Text>
                      </span>
                    </>
                  )}
                </ComboboxCreate>
              )}
            </>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
