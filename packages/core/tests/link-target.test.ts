import { describe, expect, it } from "vitest";
import { classifyLink, isExternalTarget } from "@repo/core/link-target";

const SITE = "https://anishshobithps.com";

describe("classifyLink", () => {
    it("classifies a github repo", () => {
        expect(classifyLink("https://github.com/anishshobithps/resume", SITE)).toEqual({
            kind: "github-repo",
            owner: "anishshobithps",
            repo: "resume",
        });
    });

    it("tolerates trailing slashes, .git and www", () => {
        expect(classifyLink("https://www.github.com/a/b.git/", SITE)).toEqual({
            kind: "github-repo",
            owner: "a",
            repo: "b",
        });
    });

    it("classifies a github user", () => {
        expect(classifyLink("https://github.com/anishshobithps", SITE)).toEqual({
            kind: "github-user",
            owner: "anishshobithps",
        });
    });

    it("classifies blob and tree urls", () => {
        expect(
            classifyLink("https://github.com/a/b/blob/main/.docker/Dockerfile", SITE),
        ).toEqual({
            kind: "github-file",
            owner: "a",
            repo: "b",
            ref: "main",
            path: ".docker/Dockerfile",
            isDir: false,
        });
        expect(classifyLink("https://github.com/a/b/tree/main/src/lib", SITE)).toEqual({
            kind: "github-file",
            owner: "a",
            repo: "b",
            ref: "main",
            path: "src/lib",
            isDir: true,
        });
        expect(classifyLink("https://github.com/a/b/tree/main", SITE)).toMatchObject({
            kind: "github-file",
            path: "",
            isDir: true,
        });
    });

    it("falls back to the repo for a blob url with no path", () => {
        expect(classifyLink("https://github.com/a/b/blob/main", SITE)).toEqual({
            kind: "github-repo",
            owner: "a",
            repo: "b",
        });
    });

    it("classifies releases", () => {
        expect(classifyLink("https://github.com/a/b/releases", SITE)).toEqual({
            kind: "github-release",
            owner: "a",
            repo: "b",
            tag: null,
        });
        expect(classifyLink("https://github.com/a/b/releases/latest", SITE)).toMatchObject({
            tag: null,
        });
        expect(classifyLink("https://github.com/a/b/releases/tag/v1.2.0", SITE)).toMatchObject({
            kind: "github-release",
            tag: "v1.2.0",
        });
    });

    it("leaves issues, pulls and reserved paths generic", () => {
        expect(classifyLink("https://github.com/a/b/issues/1", SITE)?.kind).toBe("generic");
        expect(classifyLink("https://github.com/features/actions", SITE)?.kind).toBe("generic");
        expect(classifyLink("https://github.com/", SITE)?.kind).toBe("generic");
    });

    it("classifies npm packages including scoped ones", () => {
        expect(classifyLink("https://www.npmjs.com/package/effect", SITE)).toEqual({
            kind: "npm",
            name: "effect",
        });
        expect(classifyLink("https://npmjs.com/package/@scope/pkg/v/1.0.0", SITE)).toEqual({
            kind: "npm",
            name: "@scope/pkg",
        });
        expect(classifyLink("https://www.npmjs.com/search?q=x", SITE)?.kind).toBe("generic");
    });

    it.each([
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10",
        "https://youtu.be/dQw4w9WgXcQ",
        "https://www.youtube.com/embed/dQw4w9WgXcQ",
        "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    ])("classifies youtube url %s", (url) => {
        expect(classifyLink(url, SITE)).toEqual({ kind: "youtube", id: "dQw4w9WgXcQ" });
    });

    it("rejects malformed youtube ids", () => {
        expect(classifyLink("https://www.youtube.com/watch?v=short", SITE)?.kind).toBe("generic");
        expect(classifyLink("https://www.youtube.com/", SITE)?.kind).toBe("generic");
    });

    it("classifies wikipedia articles in any language and on mobile", () => {
        expect(classifyLink("https://en.wikipedia.org/wiki/Poop_emoji", SITE)).toEqual({
            kind: "wikipedia",
            lang: "en",
            title: "Poop_emoji",
        });
        expect(classifyLink("https://de.m.wikipedia.org/wiki/Emoji", SITE)).toMatchObject({
            lang: "de",
            title: "Emoji",
        });
        expect(classifyLink("https://en.wikipedia.org/wiki/2025_Bengaluru_crowd_crush", SITE)).toMatchObject({
            title: "2025_Bengaluru_crowd_crush",
        });
    });

    it("leaves wikipedia special pages generic", () => {
        expect(classifyLink("https://en.wikipedia.org/wiki/Special:Random", SITE)?.kind).toBe(
            "generic",
        );
        expect(classifyLink("https://en.wikipedia.org/w/index.php?title=X", SITE)?.kind).toBe(
            "generic",
        );
    });

    it("classifies discord invites on both hosts", () => {
        expect(classifyLink("https://discord.gg/ZJJgq6nZNr", SITE)).toEqual({
            kind: "discord-invite",
            code: "ZJJgq6nZNr",
        });
        expect(classifyLink("https://discord.com/invite/ZJJgq6nZNr", SITE)).toEqual({
            kind: "discord-invite",
            code: "ZJJgq6nZNr",
        });
        expect(classifyLink("https://discord.com/channels/1/2", SITE)?.kind).toBe("generic");
    });

    it("treats the site's own host and relative paths as internal", () => {
        expect(classifyLink("https://anishshobithps.com/blog/x?y=1#z", SITE)).toEqual({
            kind: "internal",
            path: "/blog/x",
        });
        expect(classifyLink("https://www.anishshobithps.com/resume", SITE)).toMatchObject({
            kind: "internal",
        });
        expect(classifyLink("/blog/making-my-resume-machine-readable", SITE)).toEqual({
            kind: "internal",
            path: "/blog/making-my-resume-machine-readable",
        });
    });

    it("accepts several site origins", () => {
        const origins = ["http://localhost:3000", "https://anishshobithps.com"];
        expect(classifyLink("https://anishshobithps.com/blog", origins)?.kind).toBe("internal");
        expect(classifyLink("/blog", origins)).toEqual({ kind: "internal", path: "/blog" });
    });

    it("returns a generic target for any other https page", () => {
        expect(classifyLink("https://exiftool.org/", SITE)).toEqual({
            kind: "generic",
            url: "https://exiftool.org/",
        });
    });

    it("rejects non-http protocols and garbage", () => {
        expect(classifyLink("mailto:a@b.co", SITE)).toBeNull();
        expect(classifyLink("javascript:alert(1)", SITE)).toBeNull();
        expect(classifyLink("ftp://example.com/x", SITE)).toBeNull();
        expect(classifyLink("http://", SITE)).toBeNull();
    });

    it("does not throw on malformed percent encoding", () => {
        expect(() => classifyLink("https://github.com/a/%E0%A4%A", SITE)).not.toThrow();
    });
});

describe("isExternalTarget", () => {
    it("is false only for internal targets", () => {
        expect(isExternalTarget({ kind: "internal", path: "/" })).toBe(false);
        expect(isExternalTarget({ kind: "generic", url: "https://a.co/" })).toBe(true);
    });
});
