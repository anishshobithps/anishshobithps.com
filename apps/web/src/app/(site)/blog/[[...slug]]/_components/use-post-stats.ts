"use client";

import { useQuery } from "@tanstack/react-query";
import type { PostStats } from "@/app/(site)/blog/[[...slug]]/actions";
import { queryKeys } from "@/lib/query-keys";

export function usePostStats(slug: string) {
  return useQuery({
    queryKey: queryKeys.postStats(slug),
    queryFn: async (): Promise<PostStats> => {
      const response = await fetch("/api/posts/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (!response.ok) throw new Error("Failed to load post stats");
      return response.json();
    },
    staleTime: Infinity,
  });
}
