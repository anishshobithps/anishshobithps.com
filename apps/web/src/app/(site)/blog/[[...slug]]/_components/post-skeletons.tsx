import { Panel, PanelRow } from "@/components/layouts/page";
import { Skeleton } from "@repo/ui/components/skeleton";

export function StatsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading reads and comments"
      className="flex h-5 items-center gap-x-4"
    >
      <div className="flex items-center gap-1.5">
        <div aria-hidden="true" className="size-3.5 animate-pulse rounded-full bg-accent" />
        <Skeleton className="h-2.5 w-14" />
      </div>
      <Skeleton className="h-2.5 w-20" />
    </div>
  );
}

export function EndMessageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="flex h-4 items-center">
      <Skeleton className="h-2.5 w-56 max-w-full" />
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3">
      <div aria-hidden="true" className="size-8 shrink-0 animate-pulse rounded-full bg-accent" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-full max-w-md" />
        <Skeleton className="h-3 w-2/3 max-w-xs" />
      </div>
    </div>
  );
}

export function EngagementSkeleton() {
  return (
    <Panel role="status" aria-label="Loading reactions and comments">
      <PanelRow className="py-3">
        <Skeleton className="h-3 w-40" />
      </PanelRow>
      <PanelRow className="py-8">
        <div className="flex h-52 flex-col items-center justify-center gap-5">
          <div aria-hidden="true" className="size-12 animate-pulse rounded-full bg-accent" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-28" />
            ))}
          </div>
        </div>
      </PanelRow>
      <PanelRow className="py-6">
        <div className="flex h-28 flex-col justify-center gap-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-9 w-full" />
        </div>
      </PanelRow>
      <PanelRow className="py-3">
        <Skeleton className="h-3 w-24" />
      </PanelRow>
      <PanelRow className="py-8">
        <div className="flex h-52 flex-col justify-center gap-6">
          <CommentSkeleton />
          <CommentSkeleton />
        </div>
      </PanelRow>
    </Panel>
  );
}
