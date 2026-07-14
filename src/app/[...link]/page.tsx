import { recordClick, resolveLink } from "@/lib/links";
import { hasPreview } from "@/lib/links-schema";
import { buildOGUrl } from "@/lib/metadata";
import { siteConfig } from "@/lib/config";
import { Text, TypographyMuted } from "@/components/ui/typography";
import type { Metadata, Route } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { after } from "next/server";

export const dynamic = "force-dynamic";

type PageParams = { link: string[] };

function parsePath(segments: string[]): { tag: string; slug: string } | null {
  if (segments.length === 1) return { tag: "", slug: segments[0]! };
  if (segments.length === 2) return { tag: segments[0]!, slug: segments[1]! };
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { link } = await params;
  const parsed = parsePath(link);
  if (!parsed) return {};

  const resolved = await resolveLink(parsed.tag, parsed.slug);
  if (!resolved || !hasPreview(resolved)) return {};

  const title = resolved.title ?? siteConfig.name;
  const description = resolved.description ?? undefined;
  const image =
    resolved.ogImage ??
    (resolved.ogEnabled
      ? buildOGUrl({
          title,
          description: resolved.description ?? "",
          path: "link",
        })
      : undefined);
  const images = image
    ? [{ url: image, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", images },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function LinkResolverPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { link } = await params;
  const parsed = parsePath(link);
  if (!parsed) notFound();

  const resolved = await resolveLink(parsed.tag, parsed.slug);
  if (!resolved) notFound();

  after(() => recordClick(resolved.id));

  const { target } = resolved;

  if (!hasPreview(resolved)) {
    if (resolved.permanent) permanentRedirect(target as Route);
    redirect(target as Route);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace(${JSON.stringify(target)});`,
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
