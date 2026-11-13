import { describe, expect, it } from "vitest";
import { extractPageMeta } from "@repo/core/html-meta";

const BASE = "https://example.com/post/1";

describe("extractPageMeta", () => {
    it("prefers open graph tags over the title element", () => {
        const html = `<html><head>
            <title>Plain title</title>
            <meta property="og:title" content="OG title">
            <meta property="og:description" content="OG description">
            <meta property="og:site_name" content="Example">
            <meta property="og:image" content="https://cdn.example.com/a.png">
        </head><body></body></html>`;
        expect(extractPageMeta(html, BASE)).toEqual({
            title: "OG title",
            description: "OG description",
            siteName: "Example",
            image: "https://cdn.example.com/a.png",
            favicon: "https://example.com/favicon.ico",
        });
    });

    it("falls back to twitter tags, then the meta description and title", () => {
        const html = `<head><title>Fallback</title>
            <meta name="twitter:image" content="https://cdn.example.com/t.png">
            <meta name="description" content="Plain description"></head>`;
        const meta = extractPageMeta(html, BASE);
        expect(meta.title).toBe("Fallback");
        expect(meta.description).toBe("Plain description");
        expect(meta.image).toBe("https://cdn.example.com/t.png");
    });

    it("handles attribute order, single quotes and unquoted values", () => {
        const html = `<head><meta content='Single' property='og:title'>
            <meta content=Bare name=description></head>`;
        const meta = extractPageMeta(html, BASE);
        expect(meta.title).toBe("Single");
        expect(meta.description).toBe("Bare");
    });

    it("is case-insensitive about tags and attributes", () => {
        const html = `<HEAD><META PROPERTY="og:title" CONTENT="Loud"></HEAD>`;
        expect(extractPageMeta(html, BASE).title).toBe("Loud");
    });

    it("keeps a closing angle bracket inside a quoted value", () => {
        const html = `<head><meta property="og:title" content="a > b"></head>`;
        expect(extractPageMeta(html, BASE).title).toBe("a > b");
    });

    it("decodes entities and collapses whitespace", () => {
        const html = `<head><title>
            Tom &amp; Jerry &#39;s   &#x1F600;
        </title></head>`;
        expect(extractPageMeta(html, BASE).title).toBe("Tom & Jerry 's 😀");
    });

    it("resolves relative icon and image urls against the base", () => {
        const html = `<head>
            <link rel="shortcut icon" href="/static/fav.png">
            <meta property="og:image" content="../img/cover.jpg">
        </head>`;
        const meta = extractPageMeta(html, BASE);
        expect(meta.favicon).toBe("https://example.com/static/fav.png");
        expect(meta.image).toBe("https://example.com/img/cover.jpg");
    });

    it("prefers rel=icon over apple-touch-icon", () => {
        const html = `<head>
            <link rel="apple-touch-icon" href="/apple.png">
            <link rel="icon" href="/icon.png">
        </head>`;
        expect(extractPageMeta(html, BASE).favicon).toBe("https://example.com/icon.png");
    });

    it("drops non-https images and icons", () => {
        const html = `<head>
            <meta property="og:image" content="http://insecure.example.com/a.png">
            <link rel="icon" href="data:image/png;base64,AAAA">
        </head>`;
        const meta = extractPageMeta(html, BASE);
        expect(meta.image).toBeNull();
        expect(meta.favicon).toBe("https://example.com/favicon.ico");
    });

    it("ignores tags inside scripts, styles and comments", () => {
        const html = `<head>
            <script>var a = '<meta property="og:title" content="Script">';</script>
            <style>/* <meta property="og:title" content="Style"> */</style>
            <!-- <meta property="og:title" content="Comment"> -->
            <meta property="og:title" content="Real">
        </head>`;
        expect(extractPageMeta(html, BASE).title).toBe("Real");
    });

    it("ignores meta tags that appear after the head", () => {
        const html = `<head><title>Head</title></head><body><meta property="og:title" content="Body"></body>`;
        expect(extractPageMeta(html, BASE).title).toBe("Head");
    });

    it("works with no head element at all", () => {
        const html = `<title>Bare</title><p>text</p>`;
        expect(extractPageMeta(html, BASE).title).toBe("Bare");
    });

    it("returns nulls for empty or non-html input", () => {
        expect(extractPageMeta("", BASE)).toEqual({
            title: null,
            description: null,
            siteName: null,
            image: null,
            favicon: "https://example.com/favicon.ico",
        });
        expect(extractPageMeta("%PDF-1.7 binary", BASE).title).toBeNull();
    });

    it("truncates very long descriptions", () => {
        const html = `<head><meta name="description" content="${"x".repeat(2000)}"></head>`;
        const description = extractPageMeta(html, BASE).description ?? "";
        expect(description.length).toBeLessThanOrEqual(400);
        expect(description.endsWith("…")).toBe(true);
    });

    it("finishes quickly on adversarial input", () => {
        const inputs = [
            "<a ".repeat(100_000),
            `<meta content="`.repeat(50_000),
            "<title>".repeat(50_000),
            "<!--".repeat(50_000),
            "<".repeat(300_000),
            "<script>".repeat(40_000),
            `<meta ${"a=b ".repeat(60_000)}`,
        ];
        const start = performance.now();
        for (const input of inputs) extractPageMeta(input, BASE);
        expect(performance.now() - start).toBeLessThan(1500);
    });
});
