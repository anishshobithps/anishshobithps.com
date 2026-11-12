"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";

interface PreviewLinkProps extends ComponentProps<"a"> {
  preview: ReactNode;
}

export function PreviewLink({ preview, children, ...props }: PreviewLinkProps) {
  return (
    <HoverCard openDelay={350} closeDelay={120}>
      <HoverCardTrigger asChild>
        <a {...props} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </HoverCardTrigger>
      <HoverCardContent>{preview}</HoverCardContent>
    </HoverCard>
  );
}
