"use client";

import type { ComponentProps, ReactNode } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@repo/ui/components/hover-card";
import { useLinkPreviewsEnabled } from "@/lib/link-previews-preference";

interface PreviewLinkProps extends ComponentProps<"a"> {
  preview: ReactNode;
}

export function PreviewSup({
  preview,
  children,
  ...props
}: ComponentProps<"sup"> & { preview: ReactNode }) {
  const enabled = useLinkPreviewsEnabled();
  const sup = <sup {...props}>{children}</sup>;

  if (!enabled) return sup;

  return (
    <HoverCard openDelay={200} closeDelay={120}>
      <HoverCardTrigger asChild>{sup}</HoverCardTrigger>
      <HoverCardContent>{preview}</HoverCardContent>
    </HoverCard>
  );
}

export function PreviewLink({ preview, children, ...props }: PreviewLinkProps) {
  const enabled = useLinkPreviewsEnabled();

  const link = (
    <a {...props} target="_blank" rel="noopener noreferrer" data-external="">
      {children}
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
