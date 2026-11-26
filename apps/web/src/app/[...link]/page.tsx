import { recordClick, resolveLink } from "@/lib/links";
import { hasPreview, type SlugPair } from "@repo/core/links-schema";
import { buildOGUrl } from "@/lib/metadata";
import { siteConfig } from "@repo/core/site-config";
import { escapeInlineScript } from "@repo/core/inline-script";
import { Text, TypographyMuted } from "@repo/ui/components/typography";
import type { Metadata, Route } from "next";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { captureServerEvent, referrerHost } from "@/lib/analytics/server";

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

function targetHost(target: string): string | null {
  try {
    return new URL(target).host || null;
  } catch {
    return null;
  }
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

export default async function LinkResolverPage({ params }: PageProps) {
  const path = parsePath((await params).link);
  const link = path ? await resolveLink(path.tag, path.slug) : null;
  if (!path || !link) notFound();

  const referrer = referrerHost((await headers()).get("referer"));
  after(() => recordClick(link.id));
  after(() =>
    captureServerEvent("short_link_followed", {
      slug: path.slug,
      tag: path.tag,
      permanent: link.permanent,
      has_preview: hasPreview(link),
      target_host: targetHost(link.target),
      referrer_host: referrer,
    }),
  );

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
