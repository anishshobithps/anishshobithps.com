"use client";

import { useQuery } from "@tanstack/react-query";
import type { PostBundle } from "@/app/(site)/blog/[[...slug]]/actions";
import { queryKeys } from "@/lib/query-keys";
import { track } from "@/lib/analytics/events";

const readSlugs = new Set<string>();

async function fetchPostData(slug: string): Promise<PostBundle> {
  const response = await fetch("/api/posts/view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  if (!response.ok) throw new Error("Failed to load post data");
  if (!readSlugs.has(slug)) {
    readSlugs.add(slug);
    track("post_read", { slug });
  }
  return response.json();
}

export function usePostData(slug: string) {
  return useQuery({
    queryKey: queryKeys.postData(slug),
    queryFn: () => fetchPostData(slug),
    staleTime: 30_000,
  });
}
