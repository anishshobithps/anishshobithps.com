import { visit } from 'unist-util-visit';
import type { Paragraph, Root, RootContent } from 'mdast';

const HTTPS_URL = /^https:\/\//i;

function linkCardNode(url: string): RootContent {
    return {
        type: 'mdxJsxFlowElement',
        name: 'LinkCard',
        attributes: [{ type: 'mdxJsxAttribute', name: 'url', value: url }],
        children: [],
    } as unknown as RootContent;
}

export function remarkLinkCard() {
    return (tree: Root) => {
        visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
            if (!parent || parent.type !== 'root' || index === undefined) return;
            if (node.children.length !== 1) return;

            const link = node.children[0];
            if (link?.type !== 'link' || link.title) return;
            if (!HTTPS_URL.test(link.url)) return;
            if (link.children.length !== 1) return;

            const text = link.children[0];
            if (text?.type !== 'text' || text.value !== link.url) return;

            parent.children[index] = linkCardNode(link.url);
        });
    };
}
