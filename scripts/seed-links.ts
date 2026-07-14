import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import { links, linkSlugs } from "@/lib/schema";

function getDb() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    return drizzle({ client: neon(url) });
}

type SeedLink = {
    tag?: string;
    slug: string;
    target: string;
    aliases?: { tag?: string; slug: string }[];
};

const SEED_LINKS: SeedLink[] = [
    { slug: "github", target: "https://github.com/anishshobithps" },
    { slug: "linkedin", target: "https://linkedin.com/in/anishshobithps" },
    { slug: "mail", target: "mailto:anish.shobith19@gmail.com" },
];

function label(tag: string, slug: string) {
    return `/${tag ? `${tag}/` : ""}${slug}`;
}

async function main() {
    const db = getDb();

    for (const seed of SEED_LINKS) {
        const tag = seed.tag ?? "";

        const [existing] = await db
            .select({ id: linkSlugs.id })
            .from(linkSlugs)
            .where(and(eq(linkSlugs.tag, tag), eq(linkSlugs.slug, seed.slug)))
            .limit(1);
        if (existing) {
            console.log(`skip ${label(tag, seed.slug)} (already exists)`);
            continue;
        }

        const [row] = await db
            .insert(links)
            .values({ target: seed.target, enabled: true })
            .returning({ id: links.id });

        const pairs = [
            { tag, slug: seed.slug, isPrimary: true },
            ...(seed.aliases ?? []).map((a) => ({
                tag: a.tag ?? "",
                slug: a.slug,
                isPrimary: false,
            })),
        ];
        await db
            .insert(linkSlugs)
            .values(pairs.map((p) => ({ linkId: row!.id, ...p })));

        console.log(`+ ${label(tag, seed.slug)} -> ${seed.target}`);
    }

    console.log("Done seeding links.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
