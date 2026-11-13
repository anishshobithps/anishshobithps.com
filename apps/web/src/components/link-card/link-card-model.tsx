import type { ReactNode } from "react";
import { formatRelativeDate, formatShortDate } from "@repo/core/date";
import { siteConfig } from "@repo/site-config";
import {
  BookOpenIcon,
  DiscordLogoIcon,
  FileTextIcon,
  FolderOpenIcon,
  GithubLogoIcon,
  GlobeIcon,
  PackageIcon,
  ScalesIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  YoutubeLogoIcon,
  GitForkIcon,
  ClockIcon,
} from "@repo/icons";
import { formatCount } from "@/lib/github";
import type { LinkPreview } from "@/lib/link-preview/types";
import { LinkImage } from "@/components/link-card/link-image";

export interface CardStat {
  key: string;
  text: string;
  icon?: ReactNode;
  dot?: string;
}

export type MediaShape = "wide" | "square" | "round";

export interface CardModel {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  description: string | null;
  media: { src: string; shape: MediaShape } | null;
  stats: CardStat[];
  external: boolean;
  href: string;
}

const ICON = "size-3.5 shrink-0 text-muted-foreground";
const STAT_ICON = "size-3 opacity-60";

function plural(count: number, one: string, many: string) {
  return `${formatCount(count)} ${count === 1 ? one : many}`;
}

function faviconIcon(favicon: string | null): ReactNode {
  const fallback = <GlobeIcon aria-hidden="true" className={ICON} />;
  if (!favicon) return fallback;
  return <LinkImage src={favicon} className="size-3.5 rounded-sm" fallback={fallback} />;
}

function bareTitle(host: string, path: string): string {
  const segment = path.split("/").filter(Boolean).at(-1);
  if (!segment) return host;
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    decoded = segment;
  }
  const words = decoded.replace(/\.[a-z0-9]{1,5}$/i, "").replace(/[-_+]+/g, " ").trim();
  if (words === "" || /^\d+$/.test(words)) return host;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function toCardModel(preview: LinkPreview): CardModel {
  const base = { external: true, href: preview.url, media: null, description: null, stats: [] };

  switch (preview.kind) {
    case "github-repo": {
      const { data, release } = preview;
      const stats: CardStat[] = [];
      if (data.language) {
        stats.push({
          key: "language",
          text: data.language,
          dot: data.languageColor ?? "var(--muted-foreground)",
        });
      }
      stats.push({
        key: "stars",
        text: formatCount(data.stars),
        icon: <StarIcon aria-hidden="true" className={STAT_ICON} />,
      });
      if (data.forks > 0) {
        stats.push({
          key: "forks",
          text: formatCount(data.forks),
          icon: <GitForkIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      if (release) {
        stats.push({
          key: "release",
          text: release.tag,
          icon: <TagIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      if (data.license && data.license !== "NOASSERTION") {
        stats.push({
          key: "license",
          text: data.license,
          icon: <ScalesIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      return {
        ...base,
        eyebrow: "GitHub",
        icon: <GithubLogoIcon aria-hidden="true" className={ICON} />,
        title: data.fullName,
        description: data.description,
        stats,
      };
    }
    case "github-file": {
      const stats: CardStat[] = [];
      if (preview.language) {
        stats.push({
          key: "language",
          text: preview.language,
          dot: preview.languageColor ?? "var(--muted-foreground)",
        });
      }
      stats.push({
        key: "stars",
        text: formatCount(preview.stars),
        icon: <StarIcon aria-hidden="true" className={STAT_ICON} />,
      });
      return {
        ...base,
        eyebrow: preview.isDir ? "GitHub folder" : "GitHub file",
        icon: preview.isDir ? (
          <FolderOpenIcon aria-hidden="true" className={ICON} />
        ) : (
          <FileTextIcon aria-hidden="true" className={ICON} />
        ),
        title: preview.path || preview.fullName,
        description: `${preview.fullName} on ${preview.ref}`,
        stats,
      };
    }
    case "github-release": {
      const { release } = preview;
      const stats: CardStat[] = [];
      if (release.publishedAt) {
        stats.push({
          key: "published",
          text: formatRelativeDate(release.publishedAt),
          icon: <ClockIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      if (release.prerelease) stats.push({ key: "pre", text: "Pre-release" });
      return {
        ...base,
        eyebrow: "GitHub release",
        icon: <TagIcon aria-hidden="true" className={ICON} />,
        title: `${preview.fullName} ${release.tag}`,
        description: release.name && release.name !== release.tag ? release.name : null,
        stats,
      };
    }
    case "github-user": {
      return {
        ...base,
        eyebrow: "GitHub",
        icon: <GithubLogoIcon aria-hidden="true" className={ICON} />,
        title: preview.name ?? preview.login,
        description: preview.bio,
        media: preview.avatarUrl ? { src: preview.avatarUrl, shape: "round" } : null,
        stats: [
          {
            key: "followers",
            text: plural(preview.followers, "follower", "followers"),
            icon: <UsersIcon aria-hidden="true" className={STAT_ICON} />,
          },
          {
            key: "repos",
            text: plural(preview.publicRepos, "repo", "repos"),
          },
        ],
      };
    }
    case "npm": {
      const stats: CardStat[] = [{ key: "version", text: `v${preview.version}` }];
      if (preview.weeklyDownloads !== null) {
        stats.push({ key: "downloads", text: `${formatCount(preview.weeklyDownloads)}/week` });
      }
      if (preview.license) {
        stats.push({
          key: "license",
          text: preview.license,
          icon: <ScalesIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      return {
        ...base,
        eyebrow: "npm",
        icon: <PackageIcon aria-hidden="true" className={ICON} />,
        title: preview.name,
        description: preview.description,
        stats,
      };
    }
    case "youtube":
      return {
        ...base,
        eyebrow: "YouTube",
        icon: <YoutubeLogoIcon aria-hidden="true" className={ICON} />,
        title: preview.title,
        description: preview.author,
        media: { src: preview.thumbnail, shape: "wide" },
      };
    case "wikipedia":
      return {
        ...base,
        eyebrow: "Wikipedia",
        icon: <BookOpenIcon aria-hidden="true" className={ICON} />,
        title: preview.title,
        description: preview.extract ?? preview.description,
        media: preview.thumbnail ? { src: preview.thumbnail, shape: "square" } : null,
      };
    case "discord-invite": {
      const stats: CardStat[] = [];
      if (preview.online !== null) {
        stats.push({
          key: "online",
          text: `${formatCount(preview.online)} online`,
          dot: "oklch(0.696 0.17 162.48)",
        });
      }
      if (preview.members !== null) {
        stats.push({
          key: "members",
          text: plural(preview.members, "member", "members"),
          icon: <UsersIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      return {
        ...base,
        eyebrow: "Discord",
        icon: <DiscordLogoIcon aria-hidden="true" className={ICON} />,
        title: preview.name,
        description: "Open invite to join the server",
        media: preview.iconUrl ? { src: preview.iconUrl, shape: "round" } : null,
        stats,
      };
    }
    case "internal": {
      const stats: CardStat[] = [];
      if (preview.date) stats.push({ key: "date", text: formatShortDate(preview.date) });
      if (preview.readingTime) {
        stats.push({
          key: "reading",
          text: preview.readingTime,
          icon: <ClockIcon aria-hidden="true" className={STAT_ICON} />,
        });
      }
      return {
        ...base,
        external: false,
        eyebrow: siteConfig.domain,
        icon: <BookOpenIcon aria-hidden="true" className={ICON} />,
        title: preview.title,
        description: preview.description,
        stats,
      };
    }
    case "generic":
      return {
        ...base,
        eyebrow: preview.siteName ?? preview.host,
        icon: faviconIcon(preview.favicon),
        title: preview.title ?? preview.host,
        description: preview.description,
        media: preview.image ? { src: preview.image, shape: "wide" } : null,
      };
    case "bare":
      return {
        ...base,
        eyebrow: preview.host,
        icon: <GlobeIcon aria-hidden="true" className={ICON} />,
        title: bareTitle(preview.host, preview.path),
      };
  }
}
