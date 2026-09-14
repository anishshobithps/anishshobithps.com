"use server";

import { db } from "@/lib/db";
import { links, linkSlugs } from "@/lib/schema";
import { adminMutation } from "@/lib/admin-action";
import type { ActionResult } from "@/lib/action-result";
import { assertAdmin } from "@/lib/assert-admin";
import { findSlugConflicts } from "@/lib/links";
import {
  formatPath,
  linkInputSchema,
  type LinkInput,
  type SlugPair,
} from "@/lib/links-schema";
import { safeQuery } from "@/lib/safe-query";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type AdminLink = {
  id: number;
  target: string;
  title: string | null;
  description: string | null;
  ogEnabled: boolean;
  ogImage: string | null;
  permanent: boolean;
  enabled: boolean;
  clicks: number;
  primary: SlugPair;
  aliases: SlugPair[];
  createdAt: string;
};

type ParsedInput =
  | { ok: true; data: LinkInput; pairs: SlugPair[] }
  | { ok: false; message: string };

function parseInput(raw: unknown): ParsedInput {
  const parsed = linkInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  return {
    ok: true,
    data: parsed.data,
    pairs: [parsed.data.primary, ...parsed.data.aliases],
  };
}

function revalidateLinks() {
  revalidatePath("/admin/links");
}

function linkColumns(data: LinkInput) {
  return {
    target: data.target,
    title: data.title,
    description: data.description,
    ogEnabled: data.ogEnabled,
    ogImage: data.ogImage,
    permanent: data.permanent,
    enabled: data.enabled,
  };
}

function slugRows(linkId: number, pairs: SlugPair[]) {
  return pairs.map((pair, index) => ({
    linkId,
    tag: pair.tag,
    slug: pair.slug,
    isPrimary: index === 0,
  }));
}

async function takenPath(
  pairs: SlugPair[],
  excludeLinkId?: number,
): Promise<string | null> {
  const [conflict] = await findSlugConflicts(pairs, excludeLinkId);
  return conflict ? formatPath(conflict) : null;
}

export async function getAdminLinks(): Promise<AdminLink[]> {
  await assertAdmin();
  return safeQuery(
    "getAdminLinks",
    async () => {
      const rows = await db
        .select()
        .from(links)
        .orderBy(desc(links.createdAt), desc(links.id));
      if (rows.length === 0) return [];

      const slugs = await db
        .select()
        .from(linkSlugs)
        .where(
          inArray(
            linkSlugs.linkId,
            rows.map((row) => row.id),
          ),
        );

      const byLink = new Map<number, typeof slugs>();
      for (const slug of slugs) {
        const group = byLink.get(slug.linkId);
        if (group) group.push(slug);
        else byLink.set(slug.linkId, [slug]);
      }

      return rows.map((row) => {
        const group = byLink.get(row.id) ?? [];
        const primary = group.find((s) => s.isPrimary) ?? group[0];
        return {
          id: row.id,
          target: row.target,
          title: row.title,
          description: row.description,
          ogEnabled: row.ogEnabled,
          ogImage: row.ogImage,
          permanent: row.permanent,
          enabled: row.enabled,
          clicks: row.clicks,
          primary: primary
            ? { tag: primary.tag, slug: primary.slug }
            : { tag: "", slug: "" },
          aliases: group
            .filter((s) => s !== primary)
            .map((s) => ({ tag: s.tag, slug: s.slug })),
          createdAt: row.createdAt.toISOString(),
        };
      });
    },
    [],
  );
}

export async function createLink(raw: unknown): Promise<ActionResult> {
  return adminMutation("create link", async () => {
    const parsed = parseInput(raw);
    if (!parsed.ok) return parsed.message;

    const taken = await takenPath(parsed.pairs);
    if (taken) return `The path /${taken} is already taken.`;

    const [row] = await db
      .insert(links)
      .values(linkColumns(parsed.data))
      .returning({ id: links.id });

    await db.insert(linkSlugs).values(slugRows(row!.id, parsed.pairs));
  }, revalidateLinks);
}

export async function updateLink(id: number, raw: unknown): Promise<ActionResult> {
  return adminMutation("update link", async () => {
    const parsed = parseInput(raw);
    if (!parsed.ok) return parsed.message;

    const taken = await takenPath(parsed.pairs, id);
    if (taken) return `The path /${taken} is already taken.`;

    await db
      .update(links)
      .set({ ...linkColumns(parsed.data), updatedAt: new Date() })
      .where(eq(links.id, id));

    await db.delete(linkSlugs).where(eq(linkSlugs.linkId, id));
    await db.insert(linkSlugs).values(slugRows(id, parsed.pairs));
  }, revalidateLinks);
}

export async function toggleLinkEnabled(id: number): Promise<ActionResult> {
  return adminMutation("toggle link", async () => {
    await db
      .update(links)
      .set({ enabled: sql`NOT ${links.enabled}`, updatedAt: new Date() })
      .where(eq(links.id, id));
  }, revalidateLinks);
}

export async function deleteLink(id: number): Promise<ActionResult> {
  return adminMutation("delete link", async () => {
    await db.delete(links).where(eq(links.id, id));
  }, revalidateLinks);
}
