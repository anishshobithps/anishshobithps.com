import { unstable_cache } from "next/cache";
import { classifyLink, type LinkTarget } from "@repo/core/link-target";
import { siteConfig } from "@repo/site-config";
import { displayHost, isPublicHttpsUrl } from "@/lib/link-preview/http";
import { resolveDiscord } from "@/lib/link-preview/providers/discord";
import { resolveGeneric } from "@/lib/link-preview/providers/generic";
import { resolveGithub } from "@/lib/link-preview/providers/github";
import { resolveInternal } from "@/lib/link-preview/providers/internal";
import { resolveNpm } from "@/lib/link-preview/providers/npm";
import { resolveWikipedia } from "@/lib/link-preview/providers/wikipedia";
import { resolveYoutube } from "@/lib/link-preview/providers/youtube";
import type { LinkPreview } from "@/lib/link-preview/types";

const SITE_ORIGINS = [siteConfig.baseUrl, `https://${siteConfig.domain}`] as const;

const HOUR = 60 * 60;
const DAY = 24 * HOUR;
const FAILURE_WINDOW_MS = 5 * 60_000;
const MAX_REMEMBERED_FAILURES = 500;

const FAST_KINDS = new Set<LinkTarget["kind"]>([
  "github-repo",
  "github-file",
  "github-release",
  "github-user",
  "npm",
  "discord-invite",
]);

const recentFailures = new Map<string, number>();

function bare(url: string): LinkPreview {
  try {
    const parsed = new URL(url, SITE_ORIGINS[0]);
    return {
      kind: "bare",
      url,
      host: displayHost(parsed.href),
      path: parsed.pathname === "/" ? "" : parsed.pathname,
    };
  } catch {
    return { kind: "bare", url, host: url, path: "" };
  }
}

async function dispatch(target: LinkTarget, url: string): Promise<LinkPreview | null> {
  switch (target.kind) {
    case "github-repo":
    case "github-file":
    case "github-release":
    case "github-user":
      return resolveGithub(target, url);
    case "npm":
      return resolveNpm(target.name, url);
    case "youtube":
      return resolveYoutube(target.id, url);
    case "wikipedia":
      return resolveWikipedia(target.lang, target.title, url);
    case "discord-invite":
      return resolveDiscord(target.code, url);
    case "generic":
      return resolveGeneric(target.url);
    case "internal":
      return resolveInternal(target.path);
  }
}

type Outcome = { preview: LinkPreview | null };

async function resolveRich(url: string): Promise<LinkPreview | null> {
  const target = classifyLink(url, SITE_ORIGINS);
  if (!target) return null;
  return dispatch(target, url);
}

function cachedOutcome(
  name: string,
  revalidate: number,
  resolve: (url: string) => Promise<LinkPreview | null>,
) {
  return unstable_cache(
    async (url: string): Promise<Outcome> => ({
      preview: await resolve(url).catch(() => null),
    }),
    ["link-preview", name],
    { revalidate },
  );
}

const richFast = cachedOutcome("fast", HOUR, resolveRich);
const richSlow = cachedOutcome("slow", DAY, resolveRich);
const genericCached = cachedOutcome("generic", DAY, resolveGeneric);

function rememberFailure(url: string) {
  if (recentFailures.size >= MAX_REMEMBERED_FAILURES) recentFailures.clear();
  recentFailures.set(url, Date.now() + FAILURE_WINDOW_MS);
}

export async function resolveLinkPreview(url: string): Promise<LinkPreview> {
  const target = classifyLink(url, SITE_ORIGINS);
  if (!target) return bare(url);
  if (target.kind === "internal") return resolveInternal(target.path);

  const retryAfter = recentFailures.get(url);
  if (retryAfter && retryAfter > Date.now()) return bare(url);

  const rich = await (FAST_KINDS.has(target.kind) ? richFast : richSlow)(url);
  if (rich.preview) return rich.preview;

  if (target.kind !== "generic" && isPublicHttpsUrl(url)) {
    const generic = await genericCached(url);
    if (generic.preview) return generic.preview;
  }

  rememberFailure(url);
  return bare(url);
}
