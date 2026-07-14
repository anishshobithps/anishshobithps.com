"use client";

import { useState } from "react";
import { toast } from "sonner";
import { refreshResume } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  ArrowClockwiseIcon,
  FileTextIcon,
  SpinnerIcon,
} from "@/components/shared/icons";
import {
  TypographySmall,
  TypographyMuted,
} from "@/components/ui/typography";

export function ResumeRefresh() {
  const [pending, setPending] = useState(false);

  async function handleRefresh() {
    if (pending) return;
    setPending(true);
    try {
      const result = await refreshResume();
      if (result.success) {
        toast.success("Resume cache cleared. Latest PDF will load on /resume.");
      } else {
        toast.error(result.error);
      }
    } finally {
      setPending(false);
    }
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
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={pending}
        className="shrink-0 gap-1.5"
      >
        {pending ? (
          <SpinnerIcon className="size-4 animate-spin" />
        ) : (
          <ArrowClockwiseIcon className="size-4" />
        )}
        {pending ? "Refreshing…" : "Force refresh"}
      </Button>
    </div>
  );
}
