import { useSyncExternalStore } from "react";
import { createStoredValue } from "@repo/core/store";

const linkPreviews = createStoredValue({
  key: "link-previews",
  fallback: true,
  parse: (raw) => raw !== "off",
  serialize: (enabled) => (enabled ? null : "off"),
});

export const getLinkPreviewsEnabled = linkPreviews.get;
export const subscribeLinkPreviews = linkPreviews.subscribe;
export const setLinkPreviewsEnabled = linkPreviews.set;

export function useLinkPreviewsEnabled(): boolean {
  return useSyncExternalStore(
    linkPreviews.subscribe,
    linkPreviews.get,
    linkPreviews.getServer,
  );
}
