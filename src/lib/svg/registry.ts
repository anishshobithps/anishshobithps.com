import { unstable_cache } from "next/cache";
import { type AnySvgTemplate, HOUR } from "@/lib/svg/template";
import { activity } from "@/lib/svg/templates/activity";
import { banner } from "@/lib/svg/templates/banner";
import { calendar } from "@/lib/svg/templates/calendar";
import { guestbook } from "@/lib/svg/templates/guestbook";
import { heading } from "@/lib/svg/templates/heading";
import { local } from "@/lib/svg/templates/local";
import { post } from "@/lib/svg/templates/post";
import { posts } from "@/lib/svg/templates/posts";
import { resume } from "@/lib/svg/templates/resume";

export const templates: Record<string, AnySvgTemplate> = {
  banner,
  heading,
  post,
  posts,
  activity,
  calendar,
  guestbook,
  local,
  resume,
};

export function getTemplate(type: string | null): AnySvgTemplate | undefined {
  return type && Object.hasOwn(templates, type) ? templates[type] : undefined;
}

const DEPLOYMENT = process.env.VERCEL_DEPLOYMENT_ID ?? "local";

const loaders = new Map<string, (params: unknown) => Promise<unknown>>();

export function loadData(type: string, template: AnySvgTemplate, params: unknown) {
  const { load } = template;
  if (!load) return Promise.resolve(undefined);

  let cached = loaders.get(type);
  if (!cached) {
    cached = unstable_cache(async (input: unknown) => load(input), ["svg", type, DEPLOYMENT], {
      revalidate: template.revalidate ?? HOUR,
      tags: ["svg", `svg:${type}`],
    });
    loaders.set(type, cached);
  }
  return cached(params);
}
