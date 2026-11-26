import { visit } from 'unist-util-visit';
import type { FootnoteDefinition, FootnoteReference, Root } from 'mdast';

const HTTPS_URL = /^https:\/\//i;

interface Source {
    url: string;
    label: string;
}

export function remarkCitations() {
    return (tree: Root) => {
        const sources = new Map<string, Source>();

        visit(tree, 'footnoteDefinition', (definition: FootnoteDefinition) => {
            let found: Source | undefined;
            visit(definition, 'link', (link) => {
                if (found || !HTTPS_URL.test(link.url)) return;
                let label = '';
                visit(link, 'text', (text) => {
                    label += text.value;
                });
                found = { url: link.url, label: label.trim() };
            });
            if (found) sources.set(definition.identifier, found);
        });

        visit(tree, 'footnoteReference', (reference: FootnoteReference) => {
            const source = sources.get(reference.identifier);
            if (!source) return;
            const data = (reference.data ?? (reference.data = {})) as {
                hProperties?: Record<string, unknown>;
            };
            data.hProperties = {
                ...data.hProperties,
                dataCiteUrl: source.url,
                ...(source.label ? { dataCiteLabel: source.label } : {}),
            };
        });
    };
}
