"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ScrollToEngagement } from "@/app/(site)/blog/[[...slug]]/_components/end-of-post";
import { PostEngagement } from "@/app/(site)/blog/[[...slug]]/_components/post-engagement";
import {
  EngagementSkeleton,
  StatsSkeleton,
} from "@/app/(site)/blog/[[...slug]]/_components/post-skeletons";
import { usePostData } from "@/app/(site)/blog/[[...slug]]/_components/use-post-data";
import { Section } from "@/components/layouts/page";
import { useSiteAuth } from "@/components/shared/site-auth";
import { queryKeys } from "@/lib/query-keys";
import { TypographyMuted } from "@repo/ui/components/typography";
import { EyeIcon } from "@repo/icons";

export function PostStatsRow({ slug }: { slug: string }) {
  const { data, isError } = usePostData(slug);

  if (isError) return null;
  if (!data) return <StatsSkeleton />;

  const { reads, commentCount } = data.stats;

  return (
    <div className="flex h-5 items-center gap-x-4">
      <TypographyMuted className="tabular-nums text-xs flex items-center gap-1.5">
        <EyeIcon className="size-3.5 shrink-0" aria-hidden="true" />
        {reads} {reads === 1 ? "read" : "reads"}
      </TypographyMuted>
      {commentCount > 0 && <ScrollToEngagement count={commentCount} />}
    </div>
  );
}

function EngagementBody({ slug }: { slug: string }) {
  const { data } = usePostData(slug);
  const queryClient = useQueryClient();
  const { user, isLoaded } = useSiteAuth();
  const viewer = isLoaded ? (user?.id ?? "anon") : "pending";
  const lastViewer = useRef(viewer);
  const commentCount = data?.stats.commentCount;

  useEffect(() => {
    const previous = lastViewer.current;
    lastViewer.current = viewer;
    if (previous !== "pending" && previous !== viewer) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.postData(slug) });
    }
  }, [viewer, slug, queryClient]);

  useEffect(() => {
    if (commentCount === undefined) return;
    document
      .getElementById("engagement")
      ?.setAttribute("data-comment-count", String(commentCount));
  }, [commentCount]);

  if (!data) return null;

  return (
    <PostEngagement
      key={data.comments.viewerId ?? "anon"}
      slug={slug}
      initialComments={data.comments.comments}
      initialReactions={data.reactions}
      currentUserId={data.comments.viewerId}
    />
  );
}

export function EngagementSection({ slug }: { slug: string }) {
  const { data, isError } = usePostData(slug);

  return (
    <Section id="engagement" variant="flush" aria-label="Post engagement">
      {isError ? (
        <div className="py-10 text-center">
          <TypographyMuted>
            Reactions and comments are unavailable right now. Try refreshing.
          </TypographyMuted>
        </div>
      ) : data ? (
        <EngagementBody slug={slug} />
      ) : (
        <EngagementSkeleton />
      )}
    </Section>
  );
}
