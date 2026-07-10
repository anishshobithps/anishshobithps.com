import { CardGrid, CardGridItem } from "@/components/layouts/page";
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <CardGrid cols="grid-cols-1 md:grid-cols-2" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <CardGridItem key={index}>
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardGridItem>
      ))}
    </CardGrid>
  );
}
