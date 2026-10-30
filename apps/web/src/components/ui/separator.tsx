"use client";

import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
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
