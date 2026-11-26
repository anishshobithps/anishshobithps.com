import {
  dehydrate,
  HydrationBoundary,
  type QueryKey,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "@/lib/query/client";

export async function Prefetch({
  queryKey,
  queryFn,
  children,
}: {
  queryKey: QueryKey;
  queryFn: () => Promise<unknown>;
  children: ReactNode;
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({ queryKey, queryFn });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
