"use client";

import { toast } from "sonner";
import { CopyIcon } from "@repo/icons";
import { Button } from "@/components/ui/button";

export function CopyMarkdown({ markdown }: { markdown: string }) {
  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    toast.success("README markdown copied");
  };

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      <CopyIcon />
      Copy markdown
    </Button>
  );
}
