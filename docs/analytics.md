---
license: CC-BY-NC-ND-4.0
---

# Analytics and consent

Two analytics tools, both sent through this domain, and a consent banner that decides how much one of them may do.

- **Umami** counts page views. It sets no cookies, so it runs for everyone.
- **PostHog** records page views, clicks, scroll depth, heatmaps, replays, web vitals, errors, and the custom events below. What it may store depends on consent.
- **c15t** runs the banner and keeps a record of each choice in this site's database.

## Umami

The script loads from `/stats/script.js` and sends to `/stats/api/send`, both rewritten to Umami Cloud. It is only added in production builds with `NEXT_PUBLIC_UMAMI_WEBSITE_ID` set.

## PostHog

The SDK starts in [`apps/web/src/instrumentation-client.ts`](../apps/web/src/instrumentation-client.ts) before hydration, in production builds with `NEXT_PUBLIC_POSTHOG_KEY` set. Its host is `/relay`, which rewrites to PostHog's asset host for `/relay/static/*` and `/relay/array/*`, and to the ingest host for the rest. `NEXT_PUBLIC_POSTHOG_REGION` picks `us` or `eu`. The SDK strips trailing slashes so Next never redirects a POST, and `relay` is a reserved segment.

[`apps/web/src/lib/analytics/client.ts`](../apps/web/src/lib/analytics/client.ts) turns on page views and leaves, autocapture, rage and dead clicks, heatmaps, web vitals, and errors. Replays mask every input and anything marked `data-analytics-mask`, and leave out anything marked `data-analytics-block`. Every event carries the visitor's theme, sound, motion, and link-preview settings.

Events on `/admin` are dropped. Signing in identifies a visitor by Clerk ID, name, and username, never email, and opening `/admin` marks that person `is_owner`.

### Custom events

The typed list is [`apps/web/src/lib/analytics/events.ts`](../apps/web/src/lib/analytics/events.ts), and `track(name, properties)` checks the properties.

| Event | Fires when |
| --- | --- |
| `post_read`, `post_finished` | A post's view is counted, or its end scrolls into view |
| `post_reaction_set` | A reaction is saved or cleared |
| `comment_*`, `guestbook_*` | A comment or guestbook action succeeds |
| `blog_list_filtered` | The blog search or tag filter settles |
| `outbound_link_clicked` | Any external, `mailto:`, or `tel:` link. A `mailto:` records only the protocol |
| `email_copied`, `logo_downloaded` | The email is copied, or a logo downloaded |
| `command_menu_opened`, `command_menu_command` | The palette opens, or a command runs |
| `theme_changed`, `sound_toggled`, `motion_changed`, `link_previews_toggled` | A preference changes |
| `sign_in_opened`, `signed_out` | Sign-in opens, or the visitor signs out |
| `short_link_followed`, `resume_downloaded` | Sent from the server through `lib/analytics/server.ts`, with GeoIP off |

## Consent

The banner, dialog, and preferences list are in `apps/web/src/components/consent/`, adapted from c15t's shadcn registry. "Privacy settings" in the footer and command menu reopens the dialog.

The policy is in [`apps/web/src/lib/consent/backend-config.ts`](../apps/web/src/lib/consent/backend-config.ts):

| Where | What happens |
| --- | --- |
| The EEA, UK, Switzerland, Gibraltar, Quebec, and unknown locations | Opt-in. Nothing optional runs until the visitor chooses |
| US privacy states | Opt-out |
| Everywhere else | No banner, and Privacy settings can turn analytics off |

Location comes from Vercel's geo headers, so locally the opt-in banner always shows.

PostHog starts opted out with `cookieless_mode: 'on_reject'`, and [`apps/web/c15t.config.ts`](../apps/web/c15t.config.ts) opts it in or out whenever consent changes. Without consent it counts the visit cookieless, with a daily-salted server-side hash, and records no replays. With consent it runs the full setup and keeps its ID in localStorage.

The backend runs inside the app at `/api/c15t` in `hosted()` mode, so pages stay static. Records go to the `c15t` schema over Neon's direct host, because the pooled host rejects the `search_path` option. IP addresses aren't stored. The user agent, language, region, and how the choice was made are, as proof of it.

## The admin's numbers

The admin reads PostHog through its query API with `POSTHOG_PERSONAL_API_KEY`, in [`apps/web/src/lib/admin-analytics/posthog.ts`](../apps/web/src/lib/admin-analytics/posthog.ts). PostHog runs three queries at a time per project and each round trip takes a second or two, so each page packs its sections into at most three `UNION ALL` queries. Add a part to an existing query rather than a query per panel. Results are cached for five minutes, failures aren't, and each query times out after nine seconds with a notice.

## Keeping the privacy policy honest

[`/privacy-policy`](https://anishshobithps.com/privacy-policy) describes all of this from a visitor's side. Change it in the same commit when an event records something new, the consent policy changes, or a tool is added.
