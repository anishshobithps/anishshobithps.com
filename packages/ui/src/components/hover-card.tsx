"use client"

import * as React from "react"
import {
  HoverCard as HoverCardPrimitive,
  HoverCardContent as HoverCardContentPrimitive,
  HoverCardTrigger as HoverCardTriggerPrimitive,
} from "@ui-sdk/react/hover-card"

import { cn } from "@repo/ui/lib/cn"

function HoverCard({
  openDelay,
  delay = openDelay,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive> & { openDelay?: number }) {
  return <HoverCardPrimitive delay={delay} {...props} />
}

function HoverCardTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardTriggerPrimitive> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <HoverCardTriggerPrimitive render={children} {...props} />
  }
  return <HoverCardTriggerPrimitive {...props}>{children}</HoverCardTriggerPrimitive>
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 8,
  container = globalThis.document?.body,
  ...props
}: Omit<React.ComponentProps<typeof HoverCardContentPrimitive>, "className" | "children"> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <HoverCardContentPrimitive
      align={align}
      sideOffset={sideOffset}
      container={container}
      className={cn(
        "bg-popover text-popover-foreground z-50 w-auto origin-(--transform-origin) rounded-lg border p-3 shadow-md outline-hidden transition-[opacity,scale] duration-150 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
