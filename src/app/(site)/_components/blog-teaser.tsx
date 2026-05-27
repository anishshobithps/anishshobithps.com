import { source } from "@/lib/source";
import { Section } from "@/components/layouts/page";
import {
  SectionHeader,
  TypographyLead,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
import { Button } from "@/components/ui/button";
import { CaretRightIcon } from "@/components/shared/icons";
import { formatShortDate } from "@/lib/date";
import Link from "next/link";

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
      <SectionHeader>Writing</SectionHeader>

      <Reveal>
        <div className="mb-4 max-w-2xl">
          <TypographyLead>
            Thinking out loud. <TypographyMark>Code, breakdowns</TypographyMark>
            , and the occasional 3am adventure.
          </TypographyLead>
        </div>

        <div className="mb-8">
          {posts.map((post) => (
            <Link
              key={post.url}
              href={post.url}
              className="group flex items-baseline justify-between gap-4 py-4 border-b last:border-b-0 -mx-6 px-6 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10 hover:bg-muted/40 transition-colors"
            >
              <span className="font-medium text-foreground flex items-center gap-2 min-w-0">
                <span className="truncate">{post.data.title}</span>
                <CaretRightIcon
                  className="size-3.5 text-muted-foreground/50 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                  aria-hidden="true"
                />
              </span>
              <TypographyMuted
                className="shrink-0 font-mono text-xs"
                aria-hidden="true"
              >
                {formatShortDate(post.data.date!)}
              </TypographyMuted>
            </Link>
          ))}
        </div>

        <Button asChild variant="outline">
          <Link href="/blogs">
            See all posts
            <CaretRightIcon className="size-3.5" aria-hidden="true" />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}
