"use client";

import { ChatCircleIcon } from "@/components/shared/icons";
import { TypographyMuted, TypographySmall } from "@/components/ui/typography";
import type { ComponentType, ReactNode } from "react";

/** Shared empty state for the guestbook feed and the comment list. */
export function EngagementEmptyState({
  title,
  description,
  icon: Icon = ChatCircleIcon,
  children,
}: {
  title: string;
  description: string;
  icon?: ComponentType<{ size?: number }>;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4 sm:py-16 sm:px-6 text-center">
      <div
        className="size-9 border flex items-center justify-center text-muted-foreground"
        aria-hidden="true"
      >
        <Icon size={18} />
      </div>
      <div className="space-y-1">
        <TypographySmall className="font-semibold">{title}</TypographySmall>
        <TypographyMuted className="text-xs text-pretty">
          {description}
        </TypographyMuted>
      </div>
      {children}
    </div>
  );
}
