export const ANALYTICS_RELAY_PATH = "/relay";

export type PostHogRegion = "us" | "eu";

export function posthogRegion(value: string | undefined): PostHogRegion {
  return value === "eu" ? "eu" : "us";
}

export function posthogHosts(region: PostHogRegion) {
  return {
    api: `https://${region}.i.posthog.com`,
    ui: `https://${region}.posthog.com`,
  };
}

export function isPrivatePath(pathname: string | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
