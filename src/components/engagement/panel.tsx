"use client";

import { Badge } from "@/components/ui/badge";
import { SectionLabel } from "@/components/ui/typography";

export function PanelHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="relative z-10 flex items-center justify-between gap-3 px-3 py-2.5 sm:px-5 border-b">
      <SectionLabel className="text-[11px]">{label}</SectionLabel>
      {count > 0 && (
        <Badge variant="secondary" className="tabular-nums text-xs h-5 px-2">
          {count}
        </Badge>
      )}
    </div>
  );
}
