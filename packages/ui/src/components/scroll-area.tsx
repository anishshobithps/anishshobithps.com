"use client"

import * as React from "react"
import {
  ScrollArea as ScrollAreaPrimitive,
  ScrollAreaContent,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from "@ui-sdk/react/scroll-area"

import { cn } from "@repo/ui/lib/cn"

function ScrollArea({
  className,
  children,
  viewportRef,
  ...props
}: Omit<React.ComponentProps<typeof ScrollAreaPrimitive>, "className" | "children"> & {
  className?: string
  children?: React.ReactNode
  viewportRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <ScrollAreaPrimitive className={cn("relative", className)} {...props}>
      <ScrollAreaViewport
        ref={viewportRef}
        className="size-full max-h-[inherit] rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        <ScrollAreaContent>{children}</ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollBar />
    </ScrollAreaPrimitive>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: Omit<React.ComponentProps<typeof ScrollAreaScrollbar>, "className"> & {
  className?: string
}) {
  return (
    <ScrollAreaScrollbar
      orientation={orientation}
      className={cn(
        "flex touch-none p-px opacity-0 transition-opacity select-none data-visible:opacity-100",
        orientation === "vertical" && "w-2.5 border-l border-l-transparent",
        orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaThumb className="rounded-full bg-border" />
    </ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
