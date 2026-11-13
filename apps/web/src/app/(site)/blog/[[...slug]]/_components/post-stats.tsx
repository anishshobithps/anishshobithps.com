"use client";

import { usePostStats } from "@/app/(site)/blog/[[...slug]]/_components/use-post-stats";
import { ScrollToEngagement } from "@/app/(site)/blog/[[...slug]]/_components/end-of-post";
import { Section } from "@/components/layouts/page";
import { LazyComments } from "@/app/(site)/blog/[[...slug]]/_components/lazy-comments";
import { TypographyMuted } from "@repo/ui/components/typography";
import { EyeIcon } from "@repo/icons";

export function PostStatsRow({ slug }: { slug: string }) {
  const { data } = usePostStats(slug);
  const reads = data?.reads;
  const comments = data?.commentCount ?? 0;

  return (
    <div className="flex min-w-44 items-center gap-x-4">
      <TypographyMuted className="tabular-nums text-xs flex items-center gap-1.5">
        <EyeIcon className="size-3.5 shrink-0" aria-hidden="true" />
        <span className="inline-block min-w-18">
          {reads === undefined
            ? ""
            : `${reads} ${reads === 1 ? "read" : "reads"}`}
        </span>
      </TypographyMuted>
      <span className="inline-block min-w-24">
        {comments > 0 && <ScrollToEngagement count={comments} />}
      </span>
    </div>
  );
}

export function EngagementSection({ slug }: { slug: string }) {
  const { data } = usePostStats(slug);

  return (
    <Section
      id="engagement"
      variant="flush"
      aria-label="Post engagement"
      data-comment-count={data?.commentCount}
    >
      <LazyComments slug={slug} />
    </Section>
  );
}
