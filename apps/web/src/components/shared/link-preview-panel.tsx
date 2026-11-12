"use client";

import { useId } from "react";

import { LinkIcon } from "@repo/icons";
import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import {
  setLinkPreviewsEnabled,
  useLinkPreviewsEnabled,
} from "@/lib/link-previews-preference";

export function LinkPreviewPanel() {
  const enabled = useLinkPreviewsEnabled();
  const id = useId();
  const switchId = `${id}-switch`;
  const hintId = `${id}-hint`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
        <LinkIcon aria-hidden="true" className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Label htmlFor={switchId}>
          <Text as="span" variant="small">
            Link previews
          </Text>
        </Label>
        <TypographyMuted id={hintId}>
          Hover a link in a post to peek at where it goes.
        </TypographyMuted>
      </div>
      <Switch
        id={switchId}
        checked={enabled}
        onCheckedChange={setLinkPreviewsEnabled}
        aria-describedby={hintId}
      />
    </div>
  );
}
