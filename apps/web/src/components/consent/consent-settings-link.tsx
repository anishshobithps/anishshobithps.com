"use client";

import { useHeadlessConsentUI } from "@c15t/nextjs/headless";
import type { ComponentProps } from "react";
import { Button } from "@repo/ui/components/button";

export function ConsentSettingsLink({
  children = "Privacy settings",
  ...props
}: ComponentProps<typeof Button>) {
  const { openDialog } = useHeadlessConsentUI();
  return (
    <Button type="button" variant="link" {...props} onClick={openDialog}>
      {children}
    </Button>
  );
}
