"use client";

import * as React from "react";
import {
  Tooltip as TooltipPrimitive,
  TooltipArrow,
  TooltipContent as TooltipContentPrimitive,
  TooltipTrigger as TooltipTriggerPrimitive,
} from "@ui-sdk/react/tooltip";

import { cn } from "@repo/ui/lib/cn";

function Tooltip({
  delay = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive>) {
  return <TooltipPrimitive delay={delay} {...props} />;
}

function TooltipTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof TooltipTriggerPrimitive> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <TooltipTriggerPrimitive render={children} {...props} />;
  }
  return <TooltipTriggerPrimitive {...props}>{children}</TooltipTriggerPrimitive>;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof TooltipContentPrimitive>,
  "className" | "children"
> & {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <TooltipContentPrimitive
      sideOffset={sideOffset}
      className={cn(
        "bg-foreground text-background z-50 w-fit origin-(--transform-origin) rounded-md px-3 py-1.5 text-xs text-balance transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-instant:transition-none motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
      <TooltipArrow className="bg-foreground z-50 size-2.5 rotate-45 rounded-[2px] data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1" />
    </TooltipContentPrimitive>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
