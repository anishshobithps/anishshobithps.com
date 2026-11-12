import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { remarkReadingTime } from "@/lib/remarkReadingTime";
import { remarkLinkCard } from "@/lib/remarkLinkCard";
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

export const docs = defineDocs({
    dir: "content/blog",
    docs: {
        schema: pageSchema.extend({
            tags: z.array(z.string()).optional(),
            date: z.coerce.date().optional(),
            // Set explicitly in frontmatter when a post is meaningfully edited.
            // Previously derived from git history, but shallow clones on the
            // deploy host made every push re-date every post. Frontmatter is
            // deterministic and gives full control over what counts as an update.
            lastModified: z.coerce.date().optional(),
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
        remarkPlugins: [remarkReadingTime, remarkLinkCard],
        rehypeCodeOptions: {
            inline: 'tailing-curly-colon',
            themes: {
                light: 'github-light',
                dark: 'github-dark',
            },
        },
    },
});
