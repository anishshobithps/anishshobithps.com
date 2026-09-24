import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { postGrid } from "./post-grid";

export function BlogsSkeleton({ count }: { count: number }) {
  const grid = postGrid(Array.from({ length: Math.max(count, 1) }), true);

  return (
    <div className="flex flex-col -mt-6" aria-hidden="true">
      <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-3 pb-6">
        <Skeleton className="h-9 w-full sm:flex-1 min-w-0" />
        <div className="flex w-full sm:w-auto gap-3">
          <Skeleton className="h-9 w-full sm:w-28" />
          <Skeleton className="h-9 w-full sm:w-36" />
        </div>
      </div>

      <Divider />

      <div className="-mx-gutter grid grid-cols-1 gap-px bg-line md:grid-cols-2">
        {grid.cells.map((cell, index) => {
          const featured = index === 0;
          const filler = cell === "filler";
          return (
            <div
              key={index}
              className={cn(
                "overflow-hidden bg-background",
                featured && "md:col-span-2 md:grid md:grid-cols-[3fr_2fr]",
                filler && "hidden md:block",
                grid.corners(index),
              )}
            >
              {!filler && (
                <>
                  <Skeleton
                    className={cn(
                      "aspect-video rounded-none",
                      featured && "md:aspect-auto md:min-h-80",
                    )}
                  />
                  <div className="flex flex-col justify-center gap-3 p-gutter">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/5" />
                    <div className="flex gap-1.5 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
