import { source } from "@/lib/source";
import { Section } from "@/components/layouts/page";
import {
  TypographyH2,
  TypographyLead,
  TypographyMuted,
} from "@repo/ui/components/typography";
import { Reveal } from "@/components/shared/reveal";
import { ArtStage } from "@/components/layouts/hero-art";
import { PageArt } from "@repo/diagrams/page-art";
import { Button } from "@repo/ui/components/button";
import { CaretRightIcon } from "@repo/icons";
import { formatShortDate, toISOString } from "@repo/core/date";
import Link from "next/link";
import type { Route } from "next";

export function BlogTeaser() {
  const dated = source.getPages().filter((p) => p.data.date);
  const posts = dated
    .sort(
      (a, b) =>
        new Date(b.data.date!).getTime() - new Date(a.data.date!).getTime(),
    )
    .slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <Section aria-label="Latest posts" doodle="plane">
      <Reveal className="group/iso flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
          <div className="flex max-w-2xl min-w-0 flex-col gap-3">
            <TypographyH2>Latest posts</TypographyH2>
            <TypographyLead>
              Code, breakdowns, and the occasional 3am adventure.
            </TypographyLead>
          </div>
          <Button asChild variant="outline">
            <Link href="/blogs" prefetch={false}>
              See all posts
              <CaretRightIcon
                data-icon="inline-end"
                className="size-3.5"
                aria-hidden="true"
              />
            </Link>
          </Button>
        </div>

        <div className="grid items-center gap-8 md:grid-cols-[20rem_minmax(0,1fr)] lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-12">
          <ArtStage className="-mx-gutter h-44 md:mx-0 md:h-auto md:aspect-video">
            <PageArt name="lateNight" data={dated.length} />
          </ArtStage>
          <div>
            {posts.map((post) => (
              <Link
                key={post.url}
                href={post.url as Route}
                prefetch={false}
                className="group flex items-baseline justify-between gap-4 py-4 border-b last:border-b-0 -mx-gutter px-gutter md:mx-0 md:px-3 md:rounded-md hover:bg-muted/40 transition-colors"
              >
                <span className="font-medium text-foreground flex items-center gap-2 min-w-0">
                  <span className="text-pretty">{post.data.title}</span>
                  <CaretRightIcon
                    className="size-3.5 text-muted-foreground/50 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200"
                    aria-hidden="true"
                  />
                </span>
                <TypographyMuted asChild className="shrink-0 text-xs tabular-nums">
                  <time dateTime={toISOString(post.data.date!)}>
                    {formatShortDate(post.data.date!)}
                  </time>
                </TypographyMuted>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
