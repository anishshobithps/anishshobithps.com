import {
  dehydrate,
  HydrationBoundary,
  type QueryFunction,
  type QueryKey,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { getQueryClient } from "./client";

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

export async function PrefetchInfinite<TData, TPageParam>({
  queryKey,
  queryFn,
  initialPageParam,
  children,
}: {
  queryKey: QueryKey;
  queryFn: QueryFunction<TData, QueryKey, TPageParam>;
  initialPageParam: TPageParam;
  children: ReactNode;
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}
