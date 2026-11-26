import type { ReactNode } from "react";
import { Heading, TypographyMuted } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";

export function AdminPage({
  title,
  description,
  actions,
  className,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-6 p-4 md:p-6",
        className,
      )}
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1">
          <Heading as="h1" level="h3">
            {title}
          </Heading>
          {description && (
            <TypographyMuted className="text-pretty">{description}</TypographyMuted>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </header>
      {children}
    </div>
  );
}
