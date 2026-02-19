import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { Section } from "@/components/layouts/page";
import { BlogBody } from "@/components/layouts/blog";
import { source } from "@/lib/source";
import { buildMeta } from "@/lib/og";
import { getMDXComponents } from "@/mdx-components";
import { createRelativeLink } from "fumadocs-ui/mdx";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export default async function Page(props: PageProps<"/blog/[[...slug]]">) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <>
      <Section variant="hero">
        <TypographyH1 className="mt-2 mb-3">{page.data.title}</TypographyH1>
        {page.data.tags && page.data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 -mt-1">
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
        {page.data.date && (
          <TypographyMuted className="font-mono text-xs">
            {new Date(page.data.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </TypographyMuted>
        )}
        {page.data.description && (
          <TypographyLead className="mb-4">
            {page.data.description}
          </TypographyLead>
        )}
      </Section>

      <BlogBody
        toc={page.data.toc}
        createdAt={page.data.date}
        lastModified={page.data.lastModified}
      >
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </BlogBody>
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
