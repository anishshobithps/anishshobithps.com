import { visit, SKIP } from 'unist-util-visit';
import type { Root, Text } from 'mdast';

export function remarkReadingTime() {
    return (tree: Root, file: { data: Record<string, unknown> }) => {
        const textParts: string[] = [];

        visit(tree, (node) => {
            if (node.type === 'code' || node.type === 'inlineCode') {
                return SKIP;
            }

            if (node.type === 'text') {
                textParts.push((node as Text).value);
            }
        });

        const plainText = textParts.join(' ').replace(/\s+/g, ' ').trim();

        const words = plainText ? plainText.split(' ').length : 0;
        const minutes = words / 260;
        file.data.readingTime = {
            words,
            minutes,
            text: `${Math.max(1, Math.ceil(minutes))} min read`,
        };
    };
}
