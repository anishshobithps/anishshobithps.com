import { source } from "@/lib/source";
import { Section } from "@/components/layouts/page";
import {
  TypographyH2,
  TypographyLead,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
import { ArtStage } from "@/components/layouts/hero-art";
import { PageArt } from "@/components/diagrams/page-art";
import { Button } from "@/components/ui/button";
import { CaretRightIcon } from "@/components/shared/icons";
import { formatShortDate, toISOString } from "@/lib/date";
import Link from "next/link";
import type { Route } from "next";

export function BlogTeaser() {
  const posts = source
    .getPages()
    .filter((p) => p.data.date)
    .sort(
      (a, b) =>
        new Date(b.data.date!).getTime() - new Date(a.data.date!).getTime(),
    )
    .slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <Section aria-label="Recent writing">
      <TypographyH2 className="sr-only">Recent writing</TypographyH2>
      <Reveal className="group/iso">
        <div className="mb-8 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <TypographyLead className="max-w-2xl">
              <TypographyMark>Code, breakdowns</TypographyMark>, and the
              occasional 3am adventure.
            </TypographyLead>
            <Button asChild variant="outline">
              <Link href="/blogs">
                See all posts
                <CaretRightIcon
                  data-icon="inline-end"
                  className="size-3.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
          <ArtStage className="hidden aspect-video md:block">
            <PageArt name="lateNight" />
          </ArtStage>
        </div>

        <div>
          {posts.map((post) => (
            <Link
              key={post.url}
              href={post.url as Route}
              className="group flex items-baseline justify-between gap-4 py-4 border-b last:border-b-0 -mx-gutter px-gutter hover:bg-muted/40 transition-colors"
            >
              <span className="font-medium text-foreground flex items-center gap-2 min-w-0">
                <span className="text-pretty">{post.data.title}</span>
                <CaretRightIcon
                  className="size-3.5 text-muted-foreground/50 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200"
                  aria-hidden="true"
                />
              </span>
              <TypographyMuted asChild className="shrink-0 font-mono text-xs">
                <time dateTime={toISOString(post.data.date!)}>
                  {formatShortDate(post.data.date!)}
                </time>
              </TypographyMuted>
            </Link>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
