import { DecorIcon } from "@/components/ui/border";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";

export function BlogsSkeleton({ count }: { count: number }) {
  return (
    <div className="flex flex-col -mt-6" aria-hidden="true">
      <div className="flex flex-wrap sm:flex-nowrap sm:justify-end gap-3 pb-6">
        <Skeleton className="h-9 w-full sm:flex-1 min-w-0" />
        <div className="flex w-full sm:w-auto gap-3">
          <Skeleton className="h-9 w-full sm:w-28" />
          <Skeleton className="h-9 w-full sm:w-36" />
        </div>
      </div>

      <div className="relative -mx-6 sm:-mx-8 lg:-mx-10">
        <DecorIcon position="top-left" pageBorder />
        <DecorIcon position="top-right" pageBorder />
        <Divider short />
      </div>

      <div>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index}>
            {index > 0 && <Divider plain />}
            <div className="flex flex-col gap-2 py-6">
              <div className="flex items-baseline justify-between gap-4">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-1.5 mt-1">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
