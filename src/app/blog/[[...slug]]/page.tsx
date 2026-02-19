import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { Section } from "@/components/layouts/page";
import { BlogBody } from "@/components/layouts/blog";
import { BlogPostNav } from "@/components/layouts/blog-nav";
import { source } from "@/lib/source";
import { buildMeta } from "@/lib/og";
import { siteConfig } from "@/lib/config";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { CalendarDays, Clock, GitCommitHorizontal } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export default async function Page(props: PageProps<"/blog/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const readingTime = (page.data as any)._exports?.readingTime;

  const allPages = source.getPages().sort((a, b) => {
    const aDate = a.data.date ? new Date(a.data.date).getTime() : 0;
    const bDate = b.data.date ? new Date(b.data.date).getTime() : 0;
    return bDate - aDate;
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
      <Section variant="nav">
        <BlogPostNav
          pageUrl={postUrl}
          title={page.data.title}
          prevPost={prevPost}
          nextPost={nextPost}
        />
      </Section>

      <Section variant="hero">
        <TypographyH1>{page.data.title}</TypographyH1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 -mt-2">
          {page.data.date && (
            <TypographyMuted className="font-mono text-xs flex items-center gap-1.5">
              <CalendarDays className="size-3.5 shrink-0" />
              {new Date(page.data.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </TypographyMuted>
          )}
          {page.data.lastModified && (
            <TypographyMuted className="font-mono text-xs flex items-center gap-1.5">
              <GitCommitHorizontal className="size-3.5 shrink-0" />
              Updated{" "}
              {new Date(page.data.lastModified).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </TypographyMuted>
          )}
          {readingTime && (
            <TypographyMuted className="font-mono text-xs flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" />
              {readingTime.text}
            </TypographyMuted>
          )}
        </div>

        {page.data.description && (
          <TypographyLead>{page.data.description}</TypographyLead>
        )}

        {page.data.tags && page.data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {page.data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Section>

      <BlogBody toc={page.data.toc}>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </BlogBody>

      <Section variant="nav">
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

export async function generateMetadata(
  props: PageProps<"/blog/[[...slug]]">,
): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return buildMeta({
    title: page.data.title,
    pageTitle: page.data.title,
    description: page.data.description ?? "",
    path: `home / blog / ${params.slug?.join(" / ") ?? ""}`,
    tags: (page.data.tags as string[] | undefined) ?? [],
  });
}
