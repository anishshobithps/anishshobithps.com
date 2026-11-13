import type { LinkTarget } from "@repo/core/link-target";
import {
  fetchGitHubLatestRelease,
  fetchGitHubReleaseByTag,
  fetchGitHubRepoData,
  fetchGitHubUser,
} from "@/lib/github";
import type { LinkPreview } from "@/lib/link-preview/types";

export type GithubTarget = Extract<
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
