import { z } from "zod";
import { RESERVED_SEGMENTS } from "@/lib/reserved-segments";
import { slugify } from "@/lib/text";


const SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LINK_LIMITS = {
  tag: 64,
  slug: 128,
  target: 2048,
  title: 256,
  description: 600,
  ogImage: 2048,
  aliases: 24,
} as const;

const MESSAGES = {
  targetRequired: "Target URL is required.",
  targetTooLong: "Target URL is too long.",
  targetInvalid: "Enter a valid http(s):// or mailto: URL.",
  ogImageInvalid: "OG image must be a valid URL.",
  tagTooLong: `Tag is too long (max ${LINK_LIMITS.tag}).`,
  tagFormat: "Tag must be lowercase letters, numbers, and dashes.",
  tagReserved: "That tag is reserved by an existing page.",
  slugTooLong: `Slug is too long (max ${LINK_LIMITS.slug}).`,
  slugFormat: "Slug must be lowercase letters, numbers, and dashes.",
  slugReserved: "That path is reserved by an existing page.",
  slugRequired: "Slug is required.",
} as const;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidTarget(value: string): boolean {
  if (/^mailto:/i.test(value)) return value.length > "mailto:".length;
  return isHttpUrl(value);
}

export type SlugPair = { tag: string; slug: string };

export function formatPath({ tag, slug }: SlugPair): string {
  return tag ? `${tag}/${slug}` : slug;
}

export function hasPreview(link: {
  title: string | null;
  description: string | null;
  ogEnabled: boolean;
}): boolean {
  return Boolean(link.title || link.description || link.ogEnabled);
}

const targetField = z
  .string()
  .trim()
  .min(1, MESSAGES.targetRequired)
  .max(LINK_LIMITS.target, MESSAGES.targetTooLong)
  .refine(isValidTarget, { message: MESSAGES.targetInvalid });

const isBlankOrHttpUrl = (value: string) =>
  value.trim() === "" || isHttpUrl(value.trim());

const tagField = z
  .string()
  .transform(slugify)
  .refine((v) => v.length <= LINK_LIMITS.tag, { message: MESSAGES.tagTooLong })
  .refine((v) => v === "" || SEGMENT_RE.test(v), {
    message: MESSAGES.tagFormat,
  })
  .refine((v) => !RESERVED_SEGMENTS.has(v), { message: MESSAGES.tagReserved });

const slugField = z
  .string()
  .transform(slugify)
  .refine((v) => v.length <= LINK_LIMITS.slug, {
    message: MESSAGES.slugTooLong,
  })
  .refine((v) => SEGMENT_RE.test(v), { message: MESSAGES.slugFormat });

export const slugPairSchema = z
  .object({ tag: tagField, slug: slugField })
  .refine((p) => !(p.tag === "" && RESERVED_SEGMENTS.has(p.slug)), {
    message: MESSAGES.slugReserved,
    path: ["slug"],
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

export const linkInputSchema = z
  .object({
    target: targetField,
    title: optionalText(LINK_LIMITS.title),
    description: optionalText(LINK_LIMITS.description),
    ogEnabled: z.boolean(),
    ogImage: z
      .string()
      .trim()
      .max(LINK_LIMITS.ogImage)
      .refine(isBlankOrHttpUrl, { message: MESSAGES.ogImageInvalid })
      .transform((v) => (v === "" ? null : v)),
    permanent: z.boolean(),
    enabled: z.boolean(),
    primary: slugPairSchema,
    aliases: z
      .array(slugPairSchema)
      .max(LINK_LIMITS.aliases, `Too many aliases (max ${LINK_LIMITS.aliases}).`),
  })
  .superRefine((val, ctx) => {
    const seen = new Set<string>();
    [val.primary, ...val.aliases].forEach((pair, i) => {
      const key = formatPath(pair);
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate path /${key} in this link.`,
          path: i === 0 ? ["primary"] : ["aliases", i - 1],
        });
      }
      seen.add(key);
    });
  });

export const linkFormSchema = z.object({
  target: targetField,
  title: z
    .string()
    .max(LINK_LIMITS.title, `Must be ${LINK_LIMITS.title} characters or fewer.`),
  description: z
    .string()
    .max(
      LINK_LIMITS.description,
      `Must be ${LINK_LIMITS.description} characters or fewer.`,
    ),
  ogEnabled: z.boolean(),
  ogImage: z
    .string()
    .refine(isBlankOrHttpUrl, { message: MESSAGES.ogImageInvalid }),
  permanent: z.boolean(),
  enabled: z.boolean(),
  primary: z.object({
    tag: z.string(),
    slug: z.string().min(1, MESSAGES.slugRequired),
  }),
  aliases: z.array(z.object({ tag: z.string(), slug: z.string() })),
});

export type LinkInput = z.infer<typeof linkInputSchema>;

export type LinkFormValues = z.infer<typeof linkFormSchema>;
