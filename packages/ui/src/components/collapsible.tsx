"use client"

import * as React from "react"
import {
  Collapsible as CollapsiblePrimitive,
  CollapsiblePanel,
  CollapsibleTrigger as CollapsibleTriggerPrimitive,
} from "@ui-sdk/react/collapsible"

function Collapsible(props: React.ComponentProps<typeof CollapsiblePrimitive>) {
  return <CollapsiblePrimitive {...props} />
}

function CollapsibleTrigger({
  asChild = false,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleTriggerPrimitive> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return <CollapsibleTriggerPrimitive render={children} {...props} />
  }
  return (
    <CollapsibleTriggerPrimitive {...props}>{children}</CollapsibleTriggerPrimitive>
  )
}

function CollapsibleContent(props: React.ComponentProps<typeof CollapsiblePanel>) {
  return <CollapsiblePanel {...props} />
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
