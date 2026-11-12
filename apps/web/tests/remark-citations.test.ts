import { describe, expect, it } from "vitest";
import type { FootnoteDefinition, FootnoteReference, Root, RootContent } from "mdast";
import { remarkCitations } from "../src/lib/remarkCitations";

function reference(identifier: string): FootnoteReference {
    return { type: "footnoteReference", identifier, label: identifier };
}

function definition(identifier: string, ...url: string[]): FootnoteDefinition {
    return {
        type: "footnoteDefinition",
        identifier,
        label: identifier,
        children: [
            {
                type: "paragraph",
                children: [
                    { type: "text", value: "Publisher, " },
                    ...url.map((href) => ({
                        type: "link" as const,
                        url: href,
                        children: [{ type: "text" as const, value: "Title" }],
                    })),
                ],
            },
        ],
    };
}

function run(children: RootContent[]): Root {
    const tree: Root = { type: "root", children };
    remarkCitations()(tree);
    return tree;
}

function cite(node: FootnoteReference | undefined, key: string): unknown {
    return (node?.data as { hProperties?: Record<string, unknown> } | undefined)
        ?.hProperties?.[key];
}

function citeUrl(node: FootnoteReference | undefined): unknown {
    return cite(node, "dataCiteUrl");
}

describe("remarkCitations", () => {
    it("attaches the source url of a definition to its reference", () => {
        const ref = reference("a");
        run([
            { type: "paragraph", children: [{ type: "text", value: "claim" }, ref] },
            definition("a", "https://example.com/story"),
        ]);
        expect(citeUrl(ref)).toBe("https://example.com/story");
    });

    it("passes the link text of the source along as its label", () => {
        const ref = reference("a");
        run([
            { type: "paragraph", children: [ref] },
            definition("a", "https://example.com/story"),
        ]);
        expect(cite(ref, "dataCiteLabel")).toBe("Title");
    });

    it("uses the first https link when a definition has several", () => {
        const ref = reference("a");
        run([
            { type: "paragraph", children: [ref] },
            definition("a", "http://insecure.example.com/", "https://example.com/one", "https://example.com/two"),
        ]);
        expect(citeUrl(ref)).toBe("https://example.com/one");
    });

    it("gives every reference to the same definition the same url", () => {
        const first = reference("a");
        const second = reference("a");
        run([
            { type: "paragraph", children: [first] },
            { type: "paragraph", children: [second] },
            definition("a", "https://example.com/story"),
        ]);
        expect(citeUrl(first)).toBe("https://example.com/story");
        expect(citeUrl(second)).toBe("https://example.com/story");
    });

    it("leaves references without a definition or an https link alone", () => {
        const missing = reference("missing");
        const plain = reference("plain");
        run([
            { type: "paragraph", children: [missing, plain] },
            definition("plain", "http://insecure.example.com/"),
        ]);
        expect(citeUrl(missing)).toBeUndefined();
        expect(citeUrl(plain)).toBeUndefined();
    });
});
