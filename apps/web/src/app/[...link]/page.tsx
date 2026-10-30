import { recordClick, resolveLink } from "@/lib/links";
import { hasPreview, type SlugPair } from "@/lib/links-schema";
import { buildOGUrl } from "@/lib/metadata";
import { siteConfig } from "@/lib/config";
import { escapeInlineScript } from "@/lib/inline-script";
import { Text, TypographyMuted } from "@/components/ui/typography";
import type { Metadata, Route } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { after } from "next/server";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ link: string[] }> };

function parsePath(segments: string[]): SlugPair | null {
  if (segments.length === 1) return { tag: "", slug: segments[0]! };
  if (segments.length === 2) return { tag: segments[0]!, slug: segments[1]! };
  return null;
}

async function resolveFromParams({ params }: PageProps) {
  const { link } = await params;
  const path = parsePath(link);
  return path ? resolveLink(path.tag, path.slug) : null;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const link = await resolveFromParams(props);
  if (!link || !hasPreview(link)) return {};

  const title = link.title ?? siteConfig.name;
  const description = link.description ?? undefined;
  const image =
    link.ogImage ??
    (link.ogEnabled
      ? buildOGUrl({
          title,
          description: link.description ?? "",
          path: "link",
        })
      : undefined);

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function LinkResolverPage(props: PageProps) {
  const link = await resolveFromParams(props);
  if (!link) notFound();

  after(() => recordClick(link.id));

  const { target } = link;

  if (!hasPreview(link)) {
    if (link.permanent) permanentRedirect(target as Route);
    redirect(target as Route);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${escapeInlineScript(JSON.stringify(target))});`,
        }}
      />
      <TypographyMuted>Redirecting you to</TypographyMuted>
      <Text
        asChild
        variant="small"
        className="font-mono underline underline-offset-4 break-all"
      >
        <a href={target} rel="noopener noreferrer">
          {target}
        </a>
      </Text>
      <noscript>
        <TypographyMuted className="mt-2 text-xs">
          If you are not redirected automatically, use the link above.
        </TypographyMuted>
      </noscript>
    </main>
  );
}
