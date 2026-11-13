"use client";

import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon } from "@repo/icons";
import { Button } from "@repo/ui/components/button";
import { Text } from "@repo/ui/components/typography";
import { siteConfig } from "@repo/site-config";
import { copyEmail } from "@/lib/copy-email";

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
        onClick={async () => setCopied(await copyEmail())}
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
