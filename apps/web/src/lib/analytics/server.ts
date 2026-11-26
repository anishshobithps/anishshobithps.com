import { ENV } from "varlock/env";
import { PostHog } from "posthog-node";
import { posthogHosts, posthogRegion } from "@/lib/analytics/hosts";
import type { ServerAnalyticsEvents } from "@/lib/analytics/events";

let client: PostHog | null | undefined;

function getClient(): PostHog | null {
  if (client !== undefined) return client;
  const key = ENV.NEXT_PUBLIC_POSTHOG_KEY;
  client =
    key && process.env.NODE_ENV === "production"
      ? new PostHog(key, {
          host: posthogHosts(posthogRegion(ENV.NEXT_PUBLIC_POSTHOG_REGION)).api,
          flushAt: 1,
          flushInterval: 0,
          disableGeoip: true,
        })
      : null;
  return client;
}

export async function captureServerEvent<E extends keyof ServerAnalyticsEvents>(
  event: E,
  properties: ServerAnalyticsEvents[E],
  distinctId?: string,
): Promise<void> {
  const posthog = getClient();
  if (!posthog) return;
  try {
    await posthog.captureImmediate({
      distinctId: distinctId ?? crypto.randomUUID(),
      event,
      properties: {
        ...properties,
        source: "server",
        ...(distinctId ? {} : { $process_person_profile: false }),
      },
    });
  } catch {}
}

export async function markOwner(userId: string): Promise<void> {
  const posthog = getClient();
  if (!posthog) return;
  try {
    await posthog.identifyImmediate({
      distinctId: userId,
      properties: { is_owner: true },
    });
  } catch {}
}

export function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;
  try {
    return new URL(referrer).host || null;
  } catch {
    return null;
  }
}
