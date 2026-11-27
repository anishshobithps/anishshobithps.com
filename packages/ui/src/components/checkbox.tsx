"use client";

import * as React from "react";
import { CheckIcon } from "@repo/ui/icons";
import {
  Checkbox as CheckboxPrimitive,
  CheckboxIndicator,
} from "@ui-sdk/react/checkbox";

import { cn } from "@repo/ui/lib/cn";

function Checkbox({
  className,
  ...props
}: Omit<React.ComponentProps<typeof CheckboxPrimitive>, "className" | "children"> & {
  className?: string;
}) {
  return (
    <CheckboxPrimitive
      className={cn(
        "peer border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxIndicator className="grid place-content-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxIndicator>
    </CheckboxPrimitive>
  );
}

export { Checkbox };
