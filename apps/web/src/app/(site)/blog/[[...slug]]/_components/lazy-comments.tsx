"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getComments } from "@/app/(site)/blog/[[...slug]]/actions";
import { PostEngagement } from "@/app/(site)/blog/[[...slug]]/_components/post-engagement";
import { Panel, PanelRow } from "@/components/layouts/page";
import { useSiteAuth } from "@/components/shared/site-auth";
import { queryKeys } from "@/lib/query-keys";

export function CommentsFallback() {
  return (
    <Panel aria-hidden="true" className="animate-pulse">
      <PanelRow className="h-10" />
      <PanelRow className="h-44" />
      <PanelRow className="h-64" />
    </Panel>
  );
}

export function LazyComments({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wanted, setWanted] = useState(false);
  const { isLoaded, user } = useSiteAuth();
  const viewer = isLoaded ? (user?.id ?? "anon") : "pending";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setWanted(true);
      },
      { rootMargin: "1200px 0px" },
    );
    observer.observe(el);
    const idle = window.setTimeout(() => setWanted(true), 2500);
    return () => {
      observer.disconnect();
      window.clearTimeout(idle);
    };
  }, []);

  const { data } = useQuery({
    queryKey: queryKeys.comments(slug, viewer),
    queryFn: () => getComments(slug),
    enabled: wanted && isLoaded,
    staleTime: 0,
  });

  return (
    <div ref={ref}>
      {data ? (
        <PostEngagement
          key={viewer}
          slug={slug}
          initialComments={data.comments}
          currentUserId={data.viewerId}
        />
      ) : (
        <CommentsFallback />
      )}
    </div>
  );
}
