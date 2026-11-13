import { BlogCover } from "@repo/diagrams/blog-covers";
import { HeroWithArt } from "@/components/layouts/hero-art";
import { EndOfPost } from "@/app/(site)/blog/[[...slug]]/_components/end-of-post";
import {
  EngagementSection,
  PostStatsRow,
} from "@/app/(site)/blog/[[...slug]]/_components/post-stats";
import {
  PostLinksRail,
  PostLinksRecap,
  PostSourceCard,
} from "@/app/(site)/blog/[[...slug]]/_components/post-links";
import { PostRevisions } from "@/app/(site)/blog/[[...slug]]/_components/post-revisions";
import { getModifiedAt, getPostUpdates } from "@/lib/post-updates";
import { createPreviewLink } from "@/components/link-card/mdx-link";
import { BlogBody } from "@/components/layouts/blog";
import { BlogPostNav, PostPager } from "@/components/layouts/blog-nav";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import { LazySignature } from "@/components/shared/lazy-signature";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@repo/ui/components/typography";
import { siteConfig } from "@repo/site-config";
import {
  formatLongDate,
  formatShortDate,
  toISOString,
  toTimestamp,
} from "@repo/core/date";
import { buildMeta } from "@/lib/metadata";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { CalendarIcon, GitCommitIcon, ClockIcon } from "@repo/icons";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { postTransitionName } from "@/lib/view-transition";

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const readingTime = (page.data as any)._exports?.readingTime;

  const allPages = source.getPages().sort((a, b) => {
    return toTimestamp(b.data.date) - toTimestamp(a.data.date);
  });

  const currentIndex = allPages.findIndex((p) => p.url === page.url);
  const neighbour = (index: number) => {
    const post = allPages[index];
    if (!post) return null;
    const minutes = (post.data as { _exports?: { readingTime?: { text?: string } } })._exports?.readingTime?.text;
    return {
      url: post.url,
      title: post.data.title,
      description: post.data.description ?? "",
      date: post.data.date ? formatShortDate(post.data.date) : undefined,
      readingTime: minutes,
      tags: (post.data.tags ?? []).slice(0, 3),
      cover: <BlogCover slug={post.slugs.at(-1) ?? ""} number={allPages.length - index} />,
    };
  };
  const prevPost = currentIndex < allPages.length - 1 ? neighbour(currentIndex + 1) : null;
  const nextPost = currentIndex > 0 ? neighbour(currentIndex - 1) : null;
  const postUrl = `${siteConfig.baseUrl}${page.url}`;
  const links = page.data.links ?? [];
  const updates = getPostUpdates(page.data);
  const modifiedAt = getModifiedAt(page.data);
  const toDay = (date: Date) => toISOString(date).slice(0, 10);

  return (
    <>
      <JsonLd
        type="article"
        title={page.data.title}
        description={page.data.description ?? ""}
        canonicalUrl={postUrl}
        publishedAt={page.data.date ? toISOString(page.data.date) : undefined}
        updatedAt={modifiedAt ? toISOString(modifiedAt) : undefined}
        tags={page.data.tags}
      />
      <JsonLd
        type="breadcrumb"
        items={[
          { name: "Home", url: siteConfig.baseUrl },
          { name: "Blog", url: `${siteConfig.baseUrl}/blogs` },
          { name: page.data.title, url: postUrl },
        ]}
      />
      <Section variant="nav">
        <BlogPostNav pageUrl={postUrl} title={page.data.title} />
      </Section>

      <Section variant="hero" aria-label="Post header">
        <HeroWithArt
          art={
            <BlogCover
              slug={page.slugs.at(-1) ?? ""}
              number={allPages.length - currentIndex}
              zoom
            />
          }
        >
          <ViewTransition
            name={postTransitionName(page.url)}
            share="auto"
            default="none"
          >
            <TypographyH1>{page.data.title}</TypographyH1>
          </ViewTransition>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 -mt-2">
            <address className="not-italic contents">
              <TypographyMuted className="text-xs tabular-nums flex items-center gap-1.5">
                <Link
                  href={siteConfig.baseUrl as Route}
                  className="hover:text-foreground transition-colors"
                  rel="author"
                >
                  {siteConfig.name}
                </Link>
              </TypographyMuted>
            </address>
            {page.data.date && (
              <TypographyMuted className="text-xs tabular-nums flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only">Published </span>

                <time dateTime={toISOString(page.data.date)}>
                  {formatLongDate(page.data.date)}
                </time>
              </TypographyMuted>
            )}
            {updates.length > 0 ? (
              <PostRevisions
                slug={page.url}
                entries={updates.map((update) => ({
                  day: toDay(update.date),
                  kind: update.kind,
                  note: update.note,
                }))}
                publishedDay={page.data.date ? toDay(page.data.date) : undefined}
              />
            ) : (
              modifiedAt && (
                <TypographyMuted className="text-xs tabular-nums flex items-center gap-1.5">
                  <GitCommitIcon className="size-3.5 shrink-0" aria-hidden="true" />
                  Updated{" "}
                  <time dateTime={toISOString(modifiedAt)}>
                    {formatShortDate(modifiedAt)}
                  </time>
                </TypographyMuted>
              )
            )}
            {readingTime && (
              <TypographyMuted className="text-xs tabular-nums flex items-center gap-1.5">
                <ClockIcon className="size-3.5 shrink-0" aria-hidden="true" />
                {readingTime.text}
              </TypographyMuted>
            )}
            <PostStatsRow slug={page.url} />
          </div>

          {page.data.description && (
            <TypographyLead>{page.data.description}</TypographyLead>
          )}

          {page.data.tags && page.data.tags.length > 0 && (
            <ul
              role="list"
              aria-label="Post tags"
              className="flex flex-wrap gap-1.5"
            >
              {page.data.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blogs?tags=${encodeURIComponent(tag)}`}
                    className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </HeroWithArt>
      </Section>

      <BlogBody
        toc={page.data.toc}
        rail={links.length > 0 ? <PostLinksRail links={links} /> : undefined}
        railCount={links.length}
      >
        <PostSourceCard links={links} />
        <MDX
          components={getMDXComponents({
            a: createPreviewLink(createRelativeLink(source, page)),
          })}
        />
        <PostLinksRecap links={links} />
        <EndOfPost slug={page.url} />
        <LazySignature />
      </BlogBody>

      <EngagementSection slug={page.url} />

      <Section variant="compact" aria-label="More posts">
        <PostPager older={prevPost} newer={nextPost} />
      </Section>
    </>
  );
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const modifiedAt = getModifiedAt(page.data);
  const rawTitle = page.data.title;
  const metaTitle =
    rawTitle.length > 60 ? rawTitle.slice(0, 57).trimEnd() + "…" : rawTitle;

  const rawDesc = page.data.description ?? "";
  const metaDesc =
    rawDesc.length > 155 ? rawDesc.slice(0, 152).trimEnd() + "…" : rawDesc;

  return buildMeta({
    title: rawTitle,
    pageTitle: metaTitle,
    description: metaDesc,
    path: `home / blog / ${params.slug?.join(" / ") ?? ""}`,
    canonicalPath: page.url,
    type: "article",
    tags: (page.data.tags as string[] | undefined) ?? [],
    publishedAt: page.data.date ? toISOString(page.data.date) : undefined,
    updatedAt: modifiedAt ? toISOString(modifiedAt) : undefined,
  });
}
