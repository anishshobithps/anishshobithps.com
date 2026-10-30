"use client";

import { Badge } from "@/components/ui/badge";
import { PanelRow } from "@/components/layouts/page";
import { SectionLabel } from "@/components/ui/typography";

export function PanelHeader({ label, count }: { label: string; count: number }) {
  return (
    <PanelRow className="flex items-center justify-between gap-3 rounded-b-none py-2.5">
      <SectionLabel className="text-2xs">{label}</SectionLabel>
      {count > 0 && (
        <Badge variant="secondary" className="tabular-nums h-5">
          {count}
        </Badge>
      )}
    </PanelRow>
  );
}
