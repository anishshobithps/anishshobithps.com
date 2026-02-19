import readingTime from 'reading-time';
import { visit, SKIP } from 'unist-util-visit';
import type { Root, Text } from 'mdast';
import type { VFile } from 'vfile';

export function remarkReadingTime() {
    return (tree: Root, file: VFile) => {
        const textParts: string[] = [];

        visit(tree, (node) => {
            // Skip code blocks and inline code entirely — not prose
            if (node.type === 'code' || node.type === 'inlineCode') {
                return SKIP;
            }

            if (node.type === 'text') {
                textParts.push((node as Text).value);
            }
        });

        const plainText = textParts.join(' ').replace(/\s+/g, ' ').trim();

        file.data.readingTime = readingTime(plainText, { wordsPerMinute: 260 });
    };
}
