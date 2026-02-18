import { TypographyH1, TypographyLead } from "@/components/ui/typography";
import { getPageImage, source } from "@/lib/source";
import { getMDXComponents } from "@/mdx-components";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page";
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
      <header className="border-b pb-8 mb-0">
        <TypographyH1 className="mt-2 mb-3">{page.data.title}</TypographyH1>
        {page.data.description && (
          <TypographyLead className="mb-4">
            {page.data.description}
          </TypographyLead>
        )}
      </header>

      <DocsLayout
        nav={{ enabled: false }}
        tree={{ name: "Blog", children: [] }}
        sidebar={{ enabled: false, tabs: false }}
        containerProps={{
          className: "-mx-6 sm:-mx-8 lg:-mx-10 pb-16 -mb-16",
          style: {
            "--fd-nav-height": "3.5rem",
            "--fd-docs-row-1": "3.5rem",
            "--fd-docs-row-2": "3.5rem",
            "--fd-toc-width": "160px",
          } as React.CSSProperties,
        }}
      >
        <DocsPage
          toc={page.data.toc}
          tableOfContent={{ style: "clerk" }}
          breadcrumb={{ enabled: false }}
          footer={{ enabled: false }}
        >
          <DocsBody>
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          </DocsBody>
        </DocsPage>
      </DocsLayout>
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

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  };
}
