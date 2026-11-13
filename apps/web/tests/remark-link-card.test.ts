import { describe, expect, it } from "vitest";
import type { Paragraph, Root, RootContent } from "mdast";
import { remarkLinkCard } from "@/lib/remarkLinkCard";

function link(url: string, text: string = url, title?: string): RootContent {
    return {
        type: "link",
        url,
        title,
        children: [{ type: "text", value: text }],
    } as RootContent;
}

function paragraph(...children: RootContent[]): Paragraph {
    return { type: "paragraph", children: children as Paragraph["children"] };
}

function run(tree: Root): Root {
    remarkLinkCard()(tree);
    return tree;
}

describe("remarkLinkCard", () => {
    it("turns a paragraph holding only a bare https link into a LinkCard", () => {
        const tree = run({
            type: "root",
            children: [paragraph(link("https://github.com/anishshobithps/resume"))],
        });
        expect(tree.children[0]).toMatchObject({
            type: "mdxJsxFlowElement",
            name: "LinkCard",
            attributes: [
                {
                    type: "mdxJsxAttribute",
                    name: "url",
                    value: "https://github.com/anishshobithps/resume",
                },
            ],
        });
    });

    it("leaves a labelled link alone", () => {
        const tree = run({
            type: "root",
            children: [paragraph(link("https://exiftool.org/", "exiftool"))],
        });
        expect(tree.children[0]?.type).toBe("paragraph");
    });

    it("leaves a link inside a sentence alone", () => {
        const tree = run({
            type: "root",
            children: [
                paragraph(
                    { type: "text", value: "See " },
                    link("https://exiftool.org/"),
                ),
            ],
        });
        expect(tree.children[0]?.type).toBe("paragraph");
    });

    it("leaves http links and titled links alone", () => {
        const tree = run({
            type: "root",
            children: [
                paragraph(link("http://example.com/")),
                paragraph(link("https://example.com/", "https://example.com/", "title")),
            ],
        });
        expect(tree.children.map((child) => child.type)).toEqual(["paragraph", "paragraph"]);
    });

    it("does not convert paragraphs nested in lists or blockquotes", () => {
        const tree = run({
            type: "root",
            children: [
                {
                    type: "list",
                    ordered: false,
                    spread: false,
                    children: [
                        {
                            type: "listItem",
                            spread: false,
                            children: [paragraph(link("https://exiftool.org/"))],
                        },
                    ],
                },
                {
                    type: "blockquote",
                    children: [paragraph(link("https://exiftool.org/"))],
                },
            ],
        });
        const list = tree.children[0];
        const quote = tree.children[1];
        expect(list?.type === "list" && list.children[0]?.children[0]?.type).toBe("paragraph");
        expect(quote?.type === "blockquote" && quote.children[0]?.type).toBe("paragraph");
    });
});
