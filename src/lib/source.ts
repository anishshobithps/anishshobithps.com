import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { buildOGUrl } from '@/lib/og';
import { siteConfig } from '@/lib/config';

export const source = loader({
    baseUrl: '/blog',
    source: docs.toFumadocsSource(),
    plugins: [lucideIconsPlugin()],
});

export function getPageImage(page: InferPageType<typeof source>) {
    const url = buildOGUrl({
        title: page.data.title,
        description: page.data.description ?? '',
        path: `home / blog / ${page.slugs.join(' / ')}`,
        tags: (page.data.tags as string[] | undefined) ?? [],
        role: siteConfig.role,
        available: siteConfig.availableForHire,
    });

    return { url };
}
