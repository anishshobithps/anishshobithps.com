"use client";

import type { ComponentProps, ReactNode } from "react";
import { ArrowUpRightIcon } from "@repo/icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";
import { useLinkPreviewsEnabled } from "@/lib/link-previews-preference";

interface PreviewLinkProps extends ComponentProps<"a"> {
  preview: ReactNode;
}

export function PreviewLink({ preview, children, ...props }: PreviewLinkProps) {
  const enabled = useLinkPreviewsEnabled();

  const link = (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      {"⁠"}
      <ArrowUpRightIcon
        aria-hidden="true"
        className="ml-0.5 inline size-3 align-baseline opacity-60"
      />
    </a>
  );

  if (!enabled) return link;

  return (
    <HoverCard openDelay={350} closeDelay={120}>
      <HoverCardTrigger asChild>{link}</HoverCardTrigger>
      <HoverCardContent>{preview}</HoverCardContent>
    </HoverCard>
  );
}
