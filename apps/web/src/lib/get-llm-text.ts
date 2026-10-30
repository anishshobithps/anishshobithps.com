import { source } from '@/lib/source';
import type { InferPageType } from 'fumadocs-core/source';

export async function getLLMText(page: InferPageType<typeof source>) {
    const text = await page.data.getText('processed').then(t => t || page.data.getText('raw'));

    return `# ${page.data.title} (${page.url})\n\n${text}`;
}
