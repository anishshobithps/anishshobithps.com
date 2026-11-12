import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { remarkReadingTime } from "@/lib/remarkReadingTime";
import { remarkLinkCard } from "@/lib/remarkLinkCard";
import { remarkCitations } from "@/lib/remarkCitations";
import { z } from "zod/v4";

const postLinkSchema = z
    .union([
        z.string().min(1),
        z.object({
            url: z.string().min(1),
            label: z.string().optional(),
            note: z.string().optional(),
            featured: z.boolean().optional(),
        }),
    ])
    .transform(
        (value): { url: string; label?: string; note?: string; featured?: boolean } =>
            typeof value === 'string' ? { url: value } : value,
    );

const postUpdateSchema = z.object({
    date: z.coerce.date(),
    kind: z.enum(['correction', 'addition', 'sources', 'edit']).default('edit'),
    note: z.string().min(1),
});

export const docs = defineDocs({
    dir: "content/blog",
    docs: {
        schema: pageSchema.extend({
            tags: z.array(z.string()).optional(),
            date: z.coerce.date().optional(),
            lastModified: z.coerce.date().optional(),
            updates: z.array(postUpdateSchema).optional(),
            links: z.array(postLinkSchema).optional(),
        }),
        postprocess: {
            includeProcessedMarkdown: true,
            valueToExport: ['readingTime'],
        },
    },
    meta: {
        schema: metaSchema,
    },
});

export default defineConfig({
    mdxOptions: {
        remarkPlugins: [remarkReadingTime, remarkLinkCard, remarkCitations],
        remarkRehypeOptions: {
            footnoteLabel: 'Sources',
            footnoteLabelProperties: { className: [] },
        },
        rehypeCodeOptions: {
            inline: 'tailing-curly-colon',
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
        },
    },
});
