"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "@repo/ui/icons";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { siteConfig } from "@repo/core/site-config";
import { playCue } from "@repo/sounds/sound-player";
import { toast } from "@/lib/toast";
import { track } from "@/lib/analytics/events";

export async function copyEmail(location: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(siteConfig.email);
    track("email_copied", { success: true, location });
    playCue("copy");
    toast.success("Email copied", { description: siteConfig.email });
    return true;
  } catch {
    track("email_copied", { success: false, location });
    toast.error("Couldn't reach the clipboard", {
      description: `The address is ${siteConfig.email}`,
    });
    return false;
  }
}

export function CopyEmail() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <Text as="span" variant="muted">
        Reach me at
      </Text>
      <Text as="span" variant="small" translate="no">
        {siteConfig.email}
      </Text>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={copied ? "Email copied" : "Copy email address"}
        onClick={async () => setCopied(await copyEmail("contact"))}
      >
        {copied ? (
          <CheckIcon aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
