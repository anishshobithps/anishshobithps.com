import { IsoArt } from "@repo/diagrams/iso-art";
import { sheetScene } from "@repo/iso/scenes/sheet";
import { SectionLabel } from "@repo/ui/components/typography";

export function PostGridFiller({ next }: { next: number }) {
  const scene = sheetScene(next, "next", 400, 225, true);
  return (
    <div className="hatch flex h-full min-h-64 flex-col items-center justify-center gap-4 p-gutter">
      <div className="relative aspect-video w-full max-w-56">
        <IsoArt scene={scene} />
      </div>
      <SectionLabel pixel>Next one&apos;s still churning</SectionLabel>
    </div>
  );
}
