import {
  defineConsentConfig,
  hosted,
  type ConsentProviderOptions,
} from "@c15t/nextjs";
import posthog from "posthog-js";

function syncPostHog({ hasConsent }: { hasConsent: boolean }) {
  if (typeof window === "undefined" || !posthog.__loaded) return;
  if (hasConsent) {
    if (!posthog.has_opted_in_capturing()) posthog.opt_in_capturing();
  } else if (!posthog.has_opted_out_capturing()) {
    posthog.opt_out_capturing();
  }
}

const i18n = {
  messages: {
    en: {
      cookieBanner: {
        title: "Mind if I measure your visit?",
        description:
          "I use PostHog to see how pages get used: heatmaps, scroll depth, and session replays with everything you type hidden. Decline and your visit is still counted, anonymously, with nothing saved on your device.",
      },
      consentManagerDialog: {
        title: "Privacy settings",
        description:
          "Choose what this site may measure. You can change this any time from the footer or the command menu.",
      },
      consentTypes: {
        necessary: {
          title: "Necessary",
          description:
            "Sign-in, your theme and sound settings, and remembering this choice.",
        },
        measurement: {
          title: "Analytics",
          description:
            "PostHog analytics, heatmaps, and session replays, sent through this domain. Text you type is always masked.",
        },
      },
    },
  },
} satisfies ConsentProviderOptions["i18n"];

export default defineConsentConfig({
  options: { i18n },
  mode: hosted({ backendURL: "/api/c15t" }),
  scripts: [
    {
      id: "posthog-consent",
      category: "measurement",
      callbackOnly: true,
      alwaysLoad: true,
      onBeforeLoad: syncPostHog,
      onConsentChange: syncPostHog,
    },
  ],
});
