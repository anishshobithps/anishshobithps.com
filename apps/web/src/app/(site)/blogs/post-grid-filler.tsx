import { IsoBox, projector } from "@repo/diagrams/iso";
import { SectionLabel } from "@repo/ui/components/typography";

const p = projector(24, 60, 40);

export function PostGridFiller() {
  return (
    <div className="hatch flex h-full min-h-64 flex-col items-center justify-center gap-4 p-gutter">
      <svg viewBox="0 0 120 90" aria-hidden="true" className="w-28">
        <IsoBox p={p} at={[0, 0, 0]} size={[2, 2, 1]} tone="ghost" />
      </svg>
      <SectionLabel pixel>Next one&apos;s still churning</SectionLabel>
    </div>
  );
}
