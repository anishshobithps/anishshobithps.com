"use server";

import { db } from "@/lib/db";
import { links, linkSlugs } from "@/lib/schema";
import { assertAdmin } from "@/lib/assert-admin";
import { findSlugConflicts } from "@/lib/links";
import {
  formatPath,
  linkInputSchema,
  type SlugPair,
} from "@/lib/links-schema";
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

type Result = { success: boolean; error?: string };

export async function getAdminLinks(): Promise<AdminLink[]> {
  await assertAdmin();
  const rows = await db
    .select()
    .from(links)
    .orderBy(desc(links.createdAt), desc(links.id));
  if (rows.length === 0) return [];

  const slugRows = await db
    .select()
    .from(linkSlugs)
    .where(
      inArray(
        linkSlugs.linkId,
        rows.map((r) => r.id),
      ),
    );

  const byLink = new Map<number, typeof slugRows>();
  for (const s of slugRows) {
    const arr = byLink.get(s.linkId) ?? [];
    arr.push(s);
    byLink.set(s.linkId, arr);
  }

  return rows.map((r) => {
    const slugs = byLink.get(r.id) ?? [];
    const primary = slugs.find((s) => s.isPrimary) ?? slugs[0];
    const aliases = slugs.filter((s) => s !== primary);
    return {
      id: r.id,
      target: r.target,
      title: r.title,
      description: r.description,
      ogEnabled: r.ogEnabled,
      ogImage: r.ogImage,
      permanent: r.permanent,
      enabled: r.enabled,
      clicks: r.clicks,
      primary: primary
        ? { tag: primary.tag, slug: primary.slug }
        : { tag: "", slug: "" },
      aliases: aliases.map((a) => ({ tag: a.tag, slug: a.slug })),
      createdAt: r.createdAt.toISOString(),
    };
  });
}

export async function createLink(raw: unknown): Promise<Result> {
  try {
    await assertAdmin();
    const parsed = linkInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }
    const data = parsed.data;
    const pairs = [data.primary, ...data.aliases];

    const conflicts = await findSlugConflicts(pairs);
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `The path /${formatPath(conflicts[0]!)} is already taken.`,
      };
    }

    const [row] = await db
      .insert(links)
      .values({
        target: data.target,
        title: data.title,
        description: data.description,
        ogEnabled: data.ogEnabled,
        ogImage: data.ogImage,
        permanent: data.permanent,
        enabled: data.enabled,
      })
      .returning({ id: links.id });

    await db.insert(linkSlugs).values(
      pairs.map((p, i) => ({
        linkId: row!.id,
        tag: p.tag,
        slug: p.slug,
        isPrimary: i === 0,
      })),
    );

    revalidatePath("/admin/links");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create link." };
  }
}

export async function updateLink(id: number, raw: unknown): Promise<Result> {
  try {
    await assertAdmin();
    const parsed = linkInputSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input.",
      };
    }
    const data = parsed.data;
    const pairs = [data.primary, ...data.aliases];

    const conflicts = await findSlugConflicts(pairs, id);
    if (conflicts.length > 0) {
      return {
        success: false,
        error: `The path /${formatPath(conflicts[0]!)} is already taken.`,
      };
    }

    await db
      .update(links)
      .set({
        target: data.target,
        title: data.title,
        description: data.description,
        ogEnabled: data.ogEnabled,
        ogImage: data.ogImage,
        permanent: data.permanent,
        enabled: data.enabled,
        updatedAt: new Date(),
      })
      .where(eq(links.id, id));

    await db.delete(linkSlugs).where(eq(linkSlugs.linkId, id));
    await db.insert(linkSlugs).values(
      pairs.map((p, i) => ({
        linkId: id,
        tag: p.tag,
        slug: p.slug,
        isPrimary: i === 0,
      })),
    );

    revalidatePath("/admin/links");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update link." };
  }
}

export async function toggleLinkEnabled(id: number): Promise<Result> {
  try {
    await assertAdmin();
    await db
      .update(links)
      .set({ enabled: sql`NOT ${links.enabled}`, updatedAt: new Date() })
      .where(eq(links.id, id));
    revalidatePath("/admin/links");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to toggle link." };
  }
}

export async function deleteLink(id: number): Promise<Result> {
  try {
    await assertAdmin();
    await db.delete(links).where(eq(links.id, id));
    revalidatePath("/admin/links");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete link." };
  }
}
