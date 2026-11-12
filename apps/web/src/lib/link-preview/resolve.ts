import { unstable_cache } from "next/cache";
import { classifyLink, type LinkTarget } from "@repo/core/link-target";
import { siteConfig } from "@repo/site-config";
import { displayHost, isPublicHttpsUrl } from "./http";
import { resolveDiscord } from "./providers/discord";
import { resolveGeneric } from "./providers/generic";
import { resolveGithub } from "./providers/github";
import { resolveInternal } from "./providers/internal";
import { resolveNpm } from "./providers/npm";
import { resolveWikipedia } from "./providers/wikipedia";
import { resolveYoutube } from "./providers/youtube";
import type { LinkPreview } from "./types";

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

async function resolveRich(url: string): Promise<LinkPreview> {
  const target = classifyLink(url, SITE_ORIGINS);
  if (!target) throw new Error("unsupported link");
  const preview = await dispatch(target, url);
  if (!preview) throw new Error("no preview available");
  return preview;
}

async function resolveGenericOnly(url: string): Promise<LinkPreview> {
  const preview = await resolveGeneric(url);
  if (!preview) throw new Error("no preview available");
  return preview;
}

const richFast = unstable_cache(resolveRich, ["link-preview", "fast"], {
  revalidate: HOUR,
});
const richSlow = unstable_cache(resolveRich, ["link-preview", "slow"], {
  revalidate: DAY,
});
const genericCached = unstable_cache(resolveGenericOnly, ["link-preview", "generic"], {
  revalidate: DAY,
});

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

  try {
    return await (FAST_KINDS.has(target.kind) ? richFast : richSlow)(url);
  } catch {}

  if (target.kind !== "generic" && isPublicHttpsUrl(url)) {
    try {
      return await genericCached(url);
    } catch {}
  }

  rememberFailure(url);
  return bare(url);
}
