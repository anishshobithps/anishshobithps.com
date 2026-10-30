import { ENV } from "varlock/env";
import { unstable_cache } from "next/cache";
import { type AnySvgTemplate, HOUR } from "@repo/svg-kit/template";
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

const DEPLOYMENT = ENV.VERCEL_DEPLOYMENT_ID ?? "local";

type Loader = (params: unknown) => Promise<unknown>;

const loaders = new Map<AnySvgTemplate, Loader>();

for (const [type, template] of Object.entries(templates)) {
  const { load } = template;
  if (!load) continue;
  loaders.set(
    template,
    unstable_cache(async (input: unknown) => load(input), ["svg", type, DEPLOYMENT], {
      revalidate: template.revalidate ?? HOUR,
      tags: ["svg", `svg:${type}`],
    }),
  );
}

export function loadData(template: AnySvgTemplate, params: unknown) {
  const loader = loaders.get(template);
  return loader ? loader(params) : Promise.resolve(undefined);
}
