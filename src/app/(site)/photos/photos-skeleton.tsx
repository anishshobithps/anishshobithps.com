import { Panel, PanelRow } from "@/components/layouts/page";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { justifiedRows, justifiedTile, photoRowHeight } from "@/lib/photo-files";

const SHAPES = [
  [3, 2],
  [3, 4],
  [4, 3],
  [16, 9],
  [1, 1],
  [3, 4],
  [3, 2],
  [4, 5],
  [3, 2],
] as const;

export function PhotosSkeleton() {
  return (
    <Panel aria-hidden="true">
      <PanelRow className="flex items-center justify-between py-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-14" />
      </PanelRow>
      <ul role="list" className={cn(justifiedRows, photoRowHeight)}>
        {SHAPES.map(([width, height], index) => (
          <li key={index} className="bg-background" style={justifiedTile(width, height)}>
            <Skeleton className="size-full rounded-none" />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
