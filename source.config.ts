import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import lastModified from 'fumadocs-mdx/plugins/last-modified';
import { remarkReadingTime } from "@/lib/remarkReadingTime";
import { z } from "zod/v4";

export const docs = defineDocs({
    dir: "content/blog",
    docs: {
        schema: pageSchema.extend({
            tags: z.array(z.string()).optional(),
            date: z.coerce.date().optional(),
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
    plugins: [lastModified()],
    mdxOptions: {
        remarkPlugins: [remarkReadingTime],
    },
});
