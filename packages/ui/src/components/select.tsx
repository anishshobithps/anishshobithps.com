"use client";

import * as React from "react";
import { CheckIcon, CaretDownIcon } from "@repo/ui/icons";
import {
  Select as SelectPrimitive,
  SelectContent as SelectContentPrimitive,
  SelectItem as SelectItemPrimitive,
  SelectItemIndicator,
  SelectTrigger as SelectTriggerPrimitive,
  SelectValue as SelectValuePrimitive,
  type SelectProps,
} from "@ui-sdk/react/select";

import { cn } from "@repo/ui/lib/cn";

type Styled<T> = Omit<T, "className" | "children"> & {
  className?: string;
  children?: React.ReactNode;
};

function Select({
  value,
  defaultValue,
  onValueChange,
  ...props
}: Pick<
  SelectProps<string>,
  "children" | "disabled" | "name" | "required" | "open" | "onOpenChange" | "placeholder"
> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <SelectPrimitive<string>
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next: string | null) => {
        if (next !== null) onValueChange?.(next);
      }}
      {...props}
    />
  );
}

function SelectValue(props: React.ComponentProps<typeof SelectValuePrimitive>) {
  return <SelectValuePrimitive {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: Styled<React.ComponentProps<typeof SelectTriggerPrimitive>> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectTriggerPrimitive
      data-size={size}
      className={cn(
        "border-input data-placeholder:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit cursor-pointer items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      {children}
      <CaretDownIcon aria-hidden="true" className="size-4 opacity-50" />
    </SelectTriggerPrimitive>
  );
}

function SelectContent({
  className,
  sideOffset = 4,
  keepMounted = true,
  ...props
}: Styled<React.ComponentProps<typeof SelectContentPrimitive>>) {
  return (
    <SelectContentPrimitive
      sideOffset={sideOffset}
      keepMounted={keepMounted}
      className={cn(
        "bg-popover text-popover-foreground relative z-50 max-h-[min(24rem,var(--available-height))] min-w-[max(8rem,var(--anchor-width))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}

function textOf(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((child) =>
      typeof child === "string" || typeof child === "number" ? String(child) : "",
    )
    .join("");
}

function SelectItem({
  className,
  children,
  label,
  ...props
}: Styled<React.ComponentProps<typeof SelectItemPrimitive>>) {
  return (
    <SelectItemPrimitive
      label={label ?? (textOf(children) || undefined)}
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    >
      <SelectItemIndicator className="absolute right-2 flex size-3.5 items-center justify-center">
        <CheckIcon className="size-4" />
      </SelectItemIndicator>
      {children}
    </SelectItemPrimitive>
  );
}

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
};
