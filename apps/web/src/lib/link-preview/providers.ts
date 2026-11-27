import { extractPageMeta } from "@repo/core/html-meta";
import type { LinkTarget } from "@repo/core/link-target";
import { siteConfig } from "@repo/core/site-config";
import {
  fetchGitHubLatestRelease,
  fetchGitHubReleaseByTag,
  fetchGitHubRepoData,
  fetchGitHubUser,
} from "@/lib/github";
import {
  displayHost,
  fetchHtmlHead,
  fetchJson,
  httpsOrNull,
  isPublicHttpsUrl,
  num,
  str,
} from "@/lib/link-preview/http";
import type { LinkPreview } from "@/lib/link-preview/types";
import { source } from "@/lib/source";

interface ReadingTimeExports {
  _exports?: { readingTime?: { text?: string } };
}

export function resolveInternal(path: string): LinkPreview {
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "blog" && segments.length > 1) {
    const page = source.getPage(segments.slice(1));
    if (page) {
      return {
        kind: "internal",
        url: page.url,
        title: page.data.title,
        description: page.data.description ?? null,
        date: page.data.date ? page.data.date.toISOString() : null,
        readingTime:
          (page.data as unknown as ReadingTimeExports)._exports?.readingTime?.text ?? null,
      };
    }
  }

  const nav = siteConfig.nav.find((item) => item.href === (path === "/blog" ? "/blogs" : path));
  return {
    kind: "internal",
    url: path,
    title: nav?.label ?? (path === "/" ? siteConfig.name : path),
    description: null,
    date: null,
    readingTime: null,
  };
}

type GithubTarget = Extract<
  LinkTarget,
  { kind: "github-repo" | "github-file" | "github-release" | "github-user" }
>;

export async function resolveGithub(
  target: GithubTarget,
  url: string,
): Promise<LinkPreview | null> {
  switch (target.kind) {
    case "github-repo": {
      const [data, release] = await Promise.all([
        fetchGitHubRepoData(target.owner, target.repo),
        fetchGitHubLatestRelease(target.owner, target.repo),
      ]);
      return data ? { kind: "github-repo", url, data, release } : null;
    }
    case "github-file": {
      const data = await fetchGitHubRepoData(target.owner, target.repo);
      if (!data) return null;
      return {
        kind: "github-file",
        url,
        fullName: data.fullName,
        ref: target.ref,
        path: target.path,
        isDir: target.isDir,
        language: data.language,
        languageColor: data.languageColor,
        stars: data.stars,
      };
    }
    case "github-release": {
      const release = target.tag
        ? await fetchGitHubReleaseByTag(target.owner, target.repo, target.tag)
        : await fetchGitHubLatestRelease(target.owner, target.repo);
      if (!release) return null;
      return {
        kind: "github-release",
        url,
        fullName: `${target.owner}/${target.repo}`,
        release,
      };
    }
    case "github-user": {
      const user = await fetchGitHubUser(target.owner);
      return user ? { kind: "github-user", url, ...user } : null;
    }
  }
}

export async function resolveNpm(name: string, url: string): Promise<LinkPreview | null> {
  const registryName = name.startsWith("@") ? name.replaceAll("/", "%2F") : name;
  const [pkg, downloads] = await Promise.all([
    fetchJson(`https://registry.npmjs.org/${registryName}/latest`),
    fetchJson(`https://api.npmjs.org/downloads/point/last-week/${name}`),
  ]);

  const version = str(pkg?.version);
  if (!pkg || !version) return null;

  return {
    kind: "npm",
    url,
    name,
    version,
    description: str(pkg.description),
    license: str(pkg.license),
    weeklyDownloads: num(downloads?.downloads),
  };
}

export async function resolveWikipedia(
  lang: string,
  title: string,
  url: string,
): Promise<LinkPreview | null> {
  const data = await fetchJson(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  const resolvedTitle = str(data?.title);
  if (!data || !resolvedTitle || data.type === "disambiguation") return null;

  const thumbnail =
    data.thumbnail && typeof data.thumbnail === "object"
      ? httpsOrNull((data.thumbnail as Record<string, unknown>).source)
      : null;

  return {
    kind: "wikipedia",
    url,
    title: resolvedTitle,
    description: str(data.description),
    extract: str(data.extract),
    thumbnail,
  };
}

export async function resolveYoutube(id: string, url: string): Promise<LinkPreview | null> {
  const watch = `https://www.youtube.com/watch?v=${id}`;
  const data = await fetchJson(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(watch)}`,
  );
  const title = str(data?.title);
  if (!data || !title) return null;

  return {
    kind: "youtube",
    url,
    title,
    author: str(data.author_name),
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

export async function resolveDiscord(code: string, url: string): Promise<LinkPreview | null> {
  const data = await fetchJson(
    `https://discord.com/api/v10/invites/${encodeURIComponent(code)}?with_counts=true`,
  );
  const guild =
    data?.guild && typeof data.guild === "object"
      ? (data.guild as Record<string, unknown>)
      : null;
  const name = str(guild?.name);
  if (!data || !guild || !name) return null;

  const guildId = str(guild.id);
  const icon = str(guild.icon);

  return {
    kind: "discord-invite",
    url,
    name,
    iconUrl:
      guildId && icon
        ? `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=128`
        : null,
    members: num(data.approximate_member_count),
    online: num(data.approximate_presence_count),
  };
}

export async function resolveGeneric(url: string): Promise<LinkPreview | null> {
  if (!isPublicHttpsUrl(url)) return null;
  const page = await fetchHtmlHead(url);
  if (!page) return null;

  const meta = extractPageMeta(page.html, page.finalUrl);
  if (!meta.title && !meta.description) return null;

  return {
    kind: "generic",
    url,
    host: displayHost(page.finalUrl),
    title: meta.title,
    description: meta.description,
    siteName: meta.siteName,
    image: meta.image,
    favicon: meta.favicon,
  };
}
