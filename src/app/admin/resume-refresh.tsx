"use client";

import { refreshResume } from "@/app/admin/actions";
import { useActionMutation } from "@/hooks/use-action-mutation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  ArrowClockwiseIcon,
  FileTextIcon,
} from "@/components/shared/icons";
import {
  TypographySmall,
  TypographyMuted,
} from "@/components/ui/typography";

export function ResumeRefresh() {
  const { mutate: refresh, isPending: pending } = useActionMutation({
    action: refreshResume,
    successMessage: "Resume cache cleared. Latest PDF will load on /resume.",
  });

  function handleRefresh() {
    if (!pending) refresh(undefined);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground">
          <FileTextIcon className="size-5" weight="duotone" />
        </span>
        <div className="flex flex-col gap-1">
          <TypographySmall className="font-medium">Resume</TypographySmall>
          <TypographyMuted className="text-xs">
            The resume PDF is cached for up to an hour. Force a refresh to pull
            the latest release from GitHub on the next visit to /resume.
          </TypographyMuted>
        </div>
      </div>
      <TypographyMuted role="status" aria-live="polite" className="sr-only">
        {pending ? "Refreshing the resume cache…" : ""}
      </TypographyMuted>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={pending}
        className="shrink-0 gap-1.5"
      >
        {pending ? (
          <Spinner data-icon="inline-start" className="size-4" />
        ) : (
          <ArrowClockwiseIcon data-icon="inline-start" className="size-4" />
        )}
        {pending ? "Refreshing…" : "Force refresh"}
      </Button>
    </div>
  );
}
