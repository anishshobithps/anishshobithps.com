"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "@ui-sdk/react/separator";

import { cn } from "@repo/ui/lib/cn";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: Omit<React.ComponentProps<typeof SeparatorPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <SeparatorPrimitive
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "mx-1 border border-border/60 bg-transparent rounded-sm",
        orientation === "vertical" ? "w-px h-5" : "h-px w-full",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
