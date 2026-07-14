import { z } from "zod";
import { slugify } from "@/lib/text";

export const RESERVED_SEGMENTS = new Set<string>([
  "admin",
  "api",
  "og",
  "blog",
  "blogs",
  "branding",
  "guestbook",
  "llms",
  "privacy-policy",
  "projects",
  "resume",
  "sitemap",
  "robots",
  "icon",
  "apple-icon",
  "stats",
  "_next",
  "favicon-dark",
  "favicon-light",
]);

const SEGMENT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

const tagField = z
  .string()
  .transform((v) => slugify(v))
  .refine((v) => v.length <= 64, { message: "Tag is too long (max 64)." })
  .refine((v) => v === "" || SEGMENT_RE.test(v), {
    message: "Tag must be lowercase letters, numbers, and dashes.",
  })
  .refine((v) => !RESERVED_SEGMENTS.has(v), {
    message: "That tag is reserved by an existing page.",
  });

const slugField = z
  .string()
  .transform((v) => slugify(v))
  .refine((v) => v.length <= 128, { message: "Slug is too long (max 128)." })
  .refine((v) => SEGMENT_RE.test(v), {
    message: "Slug must be lowercase letters, numbers, and dashes.",
  });

export const slugPairSchema = z
  .object({ tag: tagField, slug: slugField })
  .refine((p) => !(p.tag === "" && RESERVED_SEGMENTS.has(p.slug)), {
    message: "That path is reserved by an existing page.",
    path: ["slug"],
  });

const targetField = z
  .string()
  .trim()
  .min(1, "Target URL is required.")
  .max(2048, "Target URL is too long.")
  .refine(isValidTarget, {
    message: "Enter a valid http(s):// or mailto: URL.",
  });

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer.`)
    .transform((v) => (v === "" ? null : v));

const ogImageField = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || isHttpUrl(v), {
    message: "OG image must be a valid URL.",
  })
  .transform((v) => (v === "" ? null : v));

export const linkInputSchema = z
  .object({
    target: targetField,
    title: optionalText(256),
    description: optionalText(600),
    ogEnabled: z.boolean(),
    ogImage: ogImageField,
    permanent: z.boolean(),
    enabled: z.boolean(),
    primary: slugPairSchema,
    aliases: z.array(slugPairSchema).max(24, "Too many aliases (max 24)."),
  })
  .superRefine((val, ctx) => {
    const all = [val.primary, ...val.aliases];
    const seen = new Set<string>();
    all.forEach((pair, i) => {
      const key = `${pair.tag}/${pair.slug}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate path /${formatPath(pair)} in this link.`,
          path: i === 0 ? ["primary"] : ["aliases", i - 1],
        });
      }
      seen.add(key);
    });
  });

export type LinkInput = z.infer<typeof linkInputSchema>;

export const linkFormSchema = z.object({
  target: z
    .string()
    .trim()
    .min(1, "Target URL is required.")
    .max(2048, "Target URL is too long.")
    .refine(isValidTarget, {
      message: "Enter a valid http(s):// or mailto: URL.",
    }),
  title: z.string().max(256, "Must be 256 characters or fewer."),
  description: z.string().max(600, "Must be 600 characters or fewer."),
  ogEnabled: z.boolean(),
  ogImage: z
    .string()
    .refine((v) => v.trim() === "" || isHttpUrl(v.trim()), {
      message: "OG image must be a valid URL.",
    }),
  permanent: z.boolean(),
  enabled: z.boolean(),
  primary: z.object({
    tag: z.string(),
    slug: z.string().min(1, "Slug is required."),
  }),
  aliases: z.array(z.object({ tag: z.string(), slug: z.string() })),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
