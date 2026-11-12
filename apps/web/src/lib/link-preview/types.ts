import type {
  GitHubReleaseData,
  GitHubRepoData,
} from "@/lib/github";

export type LinkPreview =
  | {
      kind: "github-repo";
      url: string;
      data: GitHubRepoData;
      release: GitHubReleaseData | null;
    }
  | {
      kind: "github-file";
      url: string;
      fullName: string;
      ref: string;
      path: string;
      isDir: boolean;
      language: string | null;
      languageColor: string | null;
      stars: number;
    }
  | {
      kind: "github-release";
      url: string;
      fullName: string;
      release: GitHubReleaseData;
    }
  | {
      kind: "github-user";
      url: string;
      login: string;
      name: string | null;
      bio: string | null;
      avatarUrl: string | null;
      followers: number;
      publicRepos: number;
    }
  | {
      kind: "npm";
      url: string;
      name: string;
      version: string;
      description: string | null;
      license: string | null;
      weeklyDownloads: number | null;
    }
  | {
      kind: "youtube";
      url: string;
      title: string;
      author: string | null;
      thumbnail: string;
    }
  | {
      kind: "wikipedia";
      url: string;
      title: string;
      description: string | null;
      extract: string | null;
      thumbnail: string | null;
    }
  | {
      kind: "discord-invite";
      url: string;
      name: string;
      iconUrl: string | null;
      members: number | null;
      online: number | null;
    }
  | {
      kind: "internal";
      url: string;
      title: string;
      description: string | null;
      date: string | null;
      readingTime: string | null;
    }
  | {
      kind: "generic";
      url: string;
      host: string;
      title: string | null;
      description: string | null;
      siteName: string | null;
      image: string | null;
      favicon: string | null;
    }
  | {
      kind: "bare";
      url: string;
      host: string;
      path: string;
    };
