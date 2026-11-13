"use client";

import { useQuery } from "@tanstack/react-query";
import type { PostBundle } from "@/app/(site)/blog/[[...slug]]/actions";
import { queryKeys } from "@/lib/query-keys";

async function fetchPostData(slug: string): Promise<PostBundle> {
  const response = await fetch("/api/posts/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  if (!response.ok) throw new Error("Failed to load post data");
  return response.json();
}

export function usePostData(slug: string) {
  return useQuery({
    queryKey: queryKeys.postData(slug),
    queryFn: () => fetchPostData(slug),
    staleTime: 30_000,
  });
}
