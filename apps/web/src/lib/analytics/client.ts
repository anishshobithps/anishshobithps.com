import posthog, { type CaptureResult } from "posthog-js";
import { ENV } from "varlock/env";
import {
  ANALYTICS_RELAY_PATH,
  isPrivatePath,
  posthogHosts,
  posthogRegion,
} from "@/lib/analytics/hosts";
import { track } from "@/lib/analytics/events";

const PASSTHROUGH_EVENTS = new Set([
  "$identify",
  "$set",
  "$groupidentify",
  "$snapshot",
]);

function stripTrailingSlash(url: URL): URL {
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url;
}

function dropPrivateEvents(event: CaptureResult | null): CaptureResult | null {
  if (!event) return null;
  if (PASSTHROUGH_EVENTS.has(event.event)) return event;
  const pathname =
    typeof event.properties?.$pathname === "string"
      ? event.properties.$pathname
      : window.location.pathname;
  return isPrivatePath(pathname) ? null : event;
}

function trackOutboundClicks() {
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      const external =
        url.protocol === "mailto:" ||
        url.protocol === "tel:" ||
        (url.protocol.startsWith("http") && url.host !== window.location.host);
      if (!external) return;
      track("outbound_link_clicked", {
        href: url.protocol.startsWith("http")
          ? `${url.origin}${url.pathname}`
          : url.protocol,
        host: url.host,
        protocol: url.protocol.replace(":", ""),
        label:
          anchor.getAttribute("aria-label") ??
          anchor.textContent?.trim().slice(0, 80) ??
          null,
      });
    },
    { capture: true },
  );
}

export function initAnalytics() {
  const key = ENV.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || process.env.NODE_ENV !== "production") return;

  posthog.init(key, {
    api_host: `${window.location.origin}${ANALYTICS_RELAY_PATH}`,
    ui_host: posthogHosts(posthogRegion(ENV.NEXT_PUBLIC_POSTHOG_REGION)).ui,
    rewriteRequestPath: stripTrailingSlash,
    defaults: "2026-08-30",
    persistence: "localStorage",
    person_profiles: "identified_only",
    capture_pageview: "history_change",
    capture_pageleave: true,
    autocapture: true,
    rageclick: true,
    capture_heatmaps: true,
    capture_dead_clicks: true,
    capture_exceptions: true,
    capture_performance: { web_vitals: true, network_timing: true },
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "[data-analytics-mask]",
      blockSelector: "[data-analytics-block]",
    },
    before_send: dropPrivateEvents,
  });

  trackOutboundClicks();
}
