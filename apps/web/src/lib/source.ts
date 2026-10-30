import { docs } from 'fumadocs-mdx:collections/server';
import { type InferPageType, loader } from 'fumadocs-core/source';
import { buildOGUrl } from '@/lib/metadata';
import { siteConfig } from '@repo/site-config';
import { toTimestamp } from '@repo/core/date';

export const source = loader({
    baseUrl: '/blog',
    source: docs.toFumadocsSource(),
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

export function getLatestPost() {
    return source
        .getPages()
        .reduce<InferPageType<typeof source> | undefined>(
            (latest, page) =>
                !latest || toTimestamp(page.data.date) > toTimestamp(latest.data.date)
                    ? page
                    : latest,
            undefined,
        );
}
