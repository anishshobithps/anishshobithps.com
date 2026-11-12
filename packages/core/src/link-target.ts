export type LinkTarget =
    | { kind: "github-repo"; owner: string; repo: string }
    | {
          kind: "github-file";
          owner: string;
          repo: string;
          ref: string;
          path: string;
          isDir: boolean;
      }
    | { kind: "github-release"; owner: string; repo: string; tag: string | null }
    | { kind: "github-user"; owner: string }
    | { kind: "npm"; name: string }
    | { kind: "youtube"; id: string }
    | { kind: "wikipedia"; lang: string; title: string }
    | { kind: "discord-invite"; code: string }
    | { kind: "internal"; path: string }
    | { kind: "generic"; url: string };

const GITHUB_RESERVED = new Set([
    "about",
    "apps",
    "codespaces",
    "collections",
    "contact",
    "customer-stories",
    "enterprise",
    "events",
    "explore",
    "features",
    "issues",
    "join",
    "login",
    "marketplace",
    "new",
    "notifications",
    "organizations",
    "orgs",
    "pricing",
    "pulls",
    "readme",
    "search",
    "security",
    "settings",
    "site",
    "sponsors",
    "stars",
    "team",
    "topics",
    "trending",
]);

const OWNER_PATTERN = /^[\w-]+$/;
const REPO_PATTERN = /^[\w.-]+$/;
const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/;
const DISCORD_CODE_PATTERN = /^[\w-]{2,32}$/;
const NPM_SCOPE_PATTERN = /^@[\w.-]+$/;
const NPM_NAME_PATTERN = /^[\w.-]+$/;
const WIKIPEDIA_HOST_PATTERN = /^([a-z]{2,3}(?:-[a-z]+)*)(?:\.m)?\.wikipedia\.org$/;

const YOUTUBE_HOSTS = new Set([
    "youtube.com",
    "m.youtube.com",
    "music.youtube.com",
    "youtube-nocookie.com",
]);

function normalizeHost(hostname: string): string {
    const host = hostname.toLowerCase();
    return host.startsWith("www.") ? host.slice(4) : host;
}

function segmentsOf(pathname: string): string[] | null {
    const out: string[] = [];
    for (const raw of pathname.split("/")) {
        if (raw === "") continue;
        try {
            out.push(decodeURIComponent(raw));
        } catch {
            return null;
        }
    }
    return out;
}

function classifyGithub(url: URL): LinkTarget | null {
    const segments = segmentsOf(url.pathname);
    if (!segments || segments.length === 0) return null;
    const [owner, rawRepo] = segments;
    if (!owner || !OWNER_PATTERN.test(owner)) return null;
    if (GITHUB_RESERVED.has(owner.toLowerCase())) return null;
    if (segments.length === 1) return { kind: "github-user", owner };

    const repo = rawRepo?.replace(/\.git$/, "");
    if (!repo || repo === "." || repo === ".." || !REPO_PATTERN.test(repo)) {
        return null;
    }
    if (segments.length === 2) return { kind: "github-repo", owner, repo };

    const section = segments[2];
    if (section === "blob" || section === "tree") {
        const ref = segments[3];
        if (!ref) return { kind: "github-repo", owner, repo };
        const path = segments.slice(4).join("/");
        if (section === "blob" && path === "") {
            return { kind: "github-repo", owner, repo };
        }
        return {
            kind: "github-file",
            owner,
            repo,
            ref,
            path,
            isDir: section === "tree",
        };
    }
    if (section === "releases") {
        if (segments.length === 3 || segments[3] === "latest") {
            return { kind: "github-release", owner, repo, tag: null };
        }
        if (segments[3] === "tag" && segments.length > 4) {
            return {
                kind: "github-release",
                owner,
                repo,
                tag: segments.slice(4).join("/"),
            };
        }
    }
    return null;
}

function classifyNpm(url: URL): LinkTarget | null {
    const segments = segmentsOf(url.pathname);
    if (!segments || segments[0] !== "package") return null;
    const first = segments[1];
    if (!first) return null;
    if (first.startsWith("@")) {
        const second = segments[2];
        if (!NPM_SCOPE_PATTERN.test(first) || !second || !NPM_NAME_PATTERN.test(second)) {
            return null;
        }
        return { kind: "npm", name: `${first}/${second}` };
    }
    if (!NPM_NAME_PATTERN.test(first)) return null;
    return { kind: "npm", name: first };
}

function classifyYoutube(host: string, url: URL): LinkTarget | null {
    let id: string | null | undefined;
    if (host === "youtu.be") {
        id = segmentsOf(url.pathname)?.[0];
    } else {
        const segments = segmentsOf(url.pathname);
        if (!segments) return null;
        if (segments[0] === "watch") id = url.searchParams.get("v");
        else if (
            segments[0] === "embed" ||
            segments[0] === "shorts" ||
            segments[0] === "live"
        ) {
            id = segments[1];
        }
    }
    if (!id || !YOUTUBE_ID_PATTERN.test(id)) return null;
    return { kind: "youtube", id };
}

function classifyWikipedia(lang: string, url: URL): LinkTarget | null {
    const rawSegments = url.pathname.split("/").filter(Boolean);
    if (rawSegments[0] !== "wiki" || rawSegments.length < 2) return null;
    let title: string;
    try {
        title = decodeURIComponent(rawSegments.slice(1).join("/"));
    } catch {
        return null;
    }
    if (title === "" || /^(special|talk|file|category|template|help):/i.test(title)) {
        return null;
    }
    return { kind: "wikipedia", lang, title: title.replace(/ /g, "_") };
}

function classifyDiscord(host: string, url: URL): LinkTarget | null {
    const segments = segmentsOf(url.pathname);
    if (!segments) return null;
    let code: string | undefined;
    if (host === "discord.gg") code = segments[0];
    else if (segments[0] === "invite") code = segments[1];
    if (!code || !DISCORD_CODE_PATTERN.test(code)) return null;
    return { kind: "discord-invite", code };
}

export function classifyLink(
    input: string,
    site: string | readonly string[],
): LinkTarget | null {
    const origins = typeof site === "string" ? [site] : site;
    const base = origins[0];
    let url: URL;
    try {
        url = new URL(input, base);
    } catch {
        return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    const host = normalizeHost(url.hostname);

    for (const origin of origins) {
        try {
            if (normalizeHost(new URL(origin).hostname) === host) {
                return { kind: "internal", path: url.pathname };
            }
        } catch {
            continue;
        }
    }

    let target: LinkTarget | null = null;
    if (host === "github.com") target = classifyGithub(url);
    else if (host === "npmjs.com") target = classifyNpm(url);
    else if (host === "youtu.be" || YOUTUBE_HOSTS.has(host)) {
        target = classifyYoutube(host, url);
    } else if (
        host === "discord.gg" ||
        host === "discord.com" ||
        host === "discordapp.com"
    ) {
        target = classifyDiscord(host, url);
    } else {
        const wiki = WIKIPEDIA_HOST_PATTERN.exec(host);
        if (wiki?.[1]) target = classifyWikipedia(wiki[1], url);
    }

    return target ?? { kind: "generic", url: url.href };
}

export function isExternalTarget(target: LinkTarget): boolean {
    return target.kind !== "internal";
}
