import { BlogReadsInfo } from "@/app/blog/[[...slug]]/blog-reads-info";
import { getComments } from "@/app/blog/[[...slug]]/actions";
import { PostEngagement } from "@/app/blog/[[...slug]]/post-engagement";
import { BlogBody } from "@/components/layouts/blog";
import { BlogPostNav } from "@/components/layouts/blog-nav";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import { Signature } from "@/components/ui/signature";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import {
  formatLongDate,
  formatShortDate,
  toISOString,
  toTimestamp,
} from "@/lib/date";
import { buildMeta } from "@/lib/og";
import { source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { auth } from "@clerk/nextjs/server";
import {
  CalendarIcon,
  GitCommitIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page(props: { params: { slug: string[] } }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const { userId } = await auth();
  const { comments } = await getComments(page.url);
  const siteOwnerId = process.env.OWNER_CLERK_USER_ID ?? "";

  const MDX = page.data.body;
  const readingTime = (page.data as any)._exports?.readingTime;

  const allPages = source.getPages().sort((a, b) => {
    return toTimestamp(b.data.date) - toTimestamp(a.data.date);
  });

  const currentIndex = allPages.findIndex((p) => p.url === page.url);
  const prevPost =
    currentIndex < allPages.length - 1
      ? {
          url: allPages[currentIndex + 1].url,
          title: allPages[currentIndex + 1].data.title,
        }
      : null;
  const nextPost =
    currentIndex > 0
      ? {
          url: allPages[currentIndex - 1].url,
          title: allPages[currentIndex - 1].data.title,
        }
      : null;
  const postUrl = `${siteConfig.baseUrl}${page.url}`;

  return (
    <>
      <JsonLd
        type="article"
        title={page.data.title}
        description={page.data.description ?? ""}
        canonicalUrl={postUrl}
        publishedAt={page.data.date ? toISOString(page.data.date) : undefined}
        updatedAt={
          page.data.lastModified
            ? toISOString(page.data.lastModified)
            : undefined
        }
        tags={page.data.tags}
      />
      <JsonLd
        type="breadcrumb"
        items={[
          { name: "Home", url: siteConfig.baseUrl },
          { name: "Blogs", url: `${siteConfig.baseUrl}/blogs` },
          { name: page.data.title, url: postUrl },
        ]}
      />
      <Section variant="nav" aria-label="Post navigation">
        <BlogPostNav
          pageUrl={postUrl}
          title={page.data.title}
          prevPost={prevPost}
          nextPost={nextPost}
        />
      </Section>

      <Section variant="hero" aria-label="Post header">
        <TypographyH1>{page.data.title}</TypographyH1>

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1.5 -mt-2"
          aria-label="Post metadata"
        >
          <address className="not-italic contents">
            <TypographyMuted className="font-mono text-xs flex items-center gap-1.5">
              <Link
                href={siteConfig.baseUrl}
                className="hover:text-foreground transition-colors"
                rel="author"
              >
                {siteConfig.name}
              </Link>
            </TypographyMuted>
          </address>
          {page.data.date && (
            <TypographyMuted
              className="font-mono text-xs flex items-center gap-1.5"
              aria-label={`Published on ${formatLongDate(page.data.date)}`}
            >
              <CalendarIcon className="size-3.5 shrink-0" aria-hidden="true" />

              <time dateTime={toISOString(page.data.date)}>
                {formatLongDate(page.data.date)}
              </time>
            </TypographyMuted>
          )}
          {page.data.lastModified && (
            <TypographyMuted
              className="font-mono text-xs flex items-center gap-1.5"
              aria-label={`Last updated ${formatShortDate(page.data.lastModified)}`}
            >
              <GitCommitIcon className="size-3.5 shrink-0" aria-hidden="true" />
              Updated{" "}
              <time dateTime={toISOString(page.data.lastModified)}>
                {formatShortDate(page.data.lastModified)}
              </time>
            </TypographyMuted>
          )}
          {readingTime && (
            <TypographyMuted
              className="font-mono text-xs flex items-center gap-1.5"
              aria-label={`Reading time: ${readingTime.text}`}
            >
              <ClockIcon className="size-3.5 shrink-0" aria-hidden="true" />
              {readingTime.text}
            </TypographyMuted>
          )}
          <BlogReadsInfo slug={page.url} />
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
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  {tag}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <BlogBody toc={page.data.toc}>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
        <Signature text={siteConfig.name} />
      </BlogBody>

      <Section variant="compact" aria-label="Post engagement">
        <PostEngagement
          slug={page.url}
          initialComments={comments}
          currentUserId={userId}
          siteOwnerId={siteOwnerId}
        />
      </Section>

      <Section variant="nav" aria-label="Post navigation">
        <BlogPostNav
          pageUrl={postUrl}
          title={page.data.title}
          prevPost={prevPost}
          nextPost={nextPost}
        />
      </Section>
    </>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: { slug: string[] };
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

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
    updatedAt: page.data.lastModified
      ? toISOString(page.data.lastModified)
      : undefined,
  });
}
