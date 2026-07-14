import { cache } from "react";
import { and, eq, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { links, linkSlugs } from "@/lib/schema";
import type { SlugPair } from "@/lib/links-schema";

export type ResolvedLink = {
  id: number;
  target: string;
  title: string | null;
  description: string | null;
  ogEnabled: boolean;
  ogImage: string | null;
  permanent: boolean;
};

export const resolveLink = cache(
  async (tag: string, slug: string): Promise<ResolvedLink | null> => {
    const [row] = await db
      .select({
        id: links.id,
        target: links.target,
        title: links.title,
        description: links.description,
        ogEnabled: links.ogEnabled,
        ogImage: links.ogImage,
        permanent: links.permanent,
      })
      .from(linkSlugs)
      .innerJoin(links, eq(linkSlugs.linkId, links.id))
      .where(
        and(
          eq(linkSlugs.tag, tag),
          eq(linkSlugs.slug, slug),
          eq(links.enabled, true),
        ),
      )
      .limit(1);
    return row ?? null;
  },
);

export async function recordClick(id: number): Promise<void> {
  await db
    .update(links)
    .set({ clicks: sql`${links.clicks} + 1` })
    .where(eq(links.id, id));
}

export async function findSlugConflicts(
  pairs: SlugPair[],
  excludeLinkId?: number,
): Promise<SlugPair[]> {
  if (pairs.length === 0) return [];
  const rows = await db
    .select({
      tag: linkSlugs.tag,
      slug: linkSlugs.slug,
      linkId: linkSlugs.linkId,
    })
    .from(linkSlugs)
    .where(
      or(
        ...pairs.map((p) =>
          and(eq(linkSlugs.tag, p.tag), eq(linkSlugs.slug, p.slug)),
        ),
      ),
    );
  return rows
    .filter((r) => excludeLinkId === undefined || r.linkId !== excludeLinkId)
    .map((r) => ({ tag: r.tag, slug: r.slug }));
}
