---
license: CC-BY-NC-ND-4.0
---

# Analytics and consent

Two analytics tools run on the site, both through this domain, and a consent banner decides how much one of them may do.

- **Umami** counts page views. It sets no cookies and stores nothing on the device, so it runs for everyone.
- **PostHog** records product analytics: page views, clicks, scroll depth, heatmaps, session replays, web vitals, errors, and the custom events below. What it may store depends on the visitor's consent.
- **c15t** runs the consent banner and keeps a record of each choice in this site's database.

## Umami

The script loads from `/stats/script.js` and sends to `/stats/api/send`. Both are rewritten to Umami Cloud in [`next.config.mjs`](../apps/web/next.config.mjs), so the browser never contacts Umami. The script is only added in production builds, and only when `NEXT_PUBLIC_UMAMI_WEBSITE_ID` is set.

Umami's own dashboard is where its numbers live. The admin doesn't read them, because Umami Cloud's API needs a paid plan.

## PostHog

### First party

The SDK is bundled with the app and starts in [`apps/web/src/instrumentation-client.ts`](../apps/web/src/instrumentation-client.ts), before hydration. Its API host is `/relay` on this domain, and `next.config.mjs` rewrites:

| Path | Goes to |
| --- | --- |
| `/relay/static/*`, `/relay/array/*` | PostHog's asset host (the recorder, heatmaps, web vitals, remote config) |
| `/relay/*` | PostHog's ingest host, with the trailing slash PostHog expects added back |

The SDK strips trailing slashes before sending (`rewriteRequestPath`), so Next never redirects a POST. `relay` is in `RESERVED_SEGMENTS`, so no short link can take it, and `proxy.ts` skips it.

PostHog only starts in production builds with `NEXT_PUBLIC_POSTHOG_KEY` set. The region comes from `NEXT_PUBLIC_POSTHOG_REGION` (`us` by default) and picks the hosts in the rewrites.

### What it captures

Configured in [`apps/web/src/lib/analytics/client.ts`](../apps/web/src/lib/analytics/client.ts):

- Page views on every client-side navigation, and page leaves with scroll depth.
- Autocapture, rage clicks, dead clicks, and heatmaps.
- Web vitals, network timing, and uncaught errors.
- Session replays with every input masked. Anything marked `data-analytics-mask` is masked, and anything marked `data-analytics-block` is left out of the replay entirely. The admin is blocked.
- Every event carries the visitor's theme, sound, motion, and link-preview settings, so heatmaps can be split by them.

Events on `/admin` are dropped before they're sent. Signing in identifies the visitor by their Clerk user ID, name, and username, never the email. Opening `/admin` marks that person as `is_owner` from the server, so the owner can be filtered out in PostHog.

### Custom events

The typed list is in [`apps/web/src/lib/analytics/events.ts`](../apps/web/src/lib/analytics/events.ts). Call `track(name, properties)` and TypeScript checks the properties.

| Event | Fires when |
| --- | --- |
| `post_read` | A post's view is counted, once per post per page load |
| `post_finished` | The end-of-post marker scrolls into or past view |
| `post_reaction_set` | A reaction is saved or cleared |
| `comment_posted`, `comment_deleted`, `comment_like_toggled` | A comment action succeeds |
| `guestbook_signed`, `guestbook_entry_deleted`, `guestbook_like_toggled` | A guestbook action succeeds |
| `blog_list_filtered` | The blog search or tag filter settles for 800 ms |
| `outbound_link_clicked` | Any link to another site, `mailto:`, or `tel:`. A `mailto:` records only the protocol |
| `email_copied` | The email is copied, from the contact section or the command menu |
| `command_menu_opened`, `command_menu_command` | The palette opens, or one of its commands runs |
| `theme_changed`, `sound_toggled`, `motion_changed`, `link_previews_toggled` | A preference changes, from anywhere |
| `logo_downloaded` | A logo is downloaded from `/branding` |
| `sign_in_opened`, `signed_out` | Sign-in opens, or the visitor signs out |
| `short_link_followed` | A short link resolves. Sent from the server with a fresh random ID |
| `resume_downloaded` | `/api/resume/download` is hit. Sent from the server |

The two server events go through [`apps/web/src/lib/analytics/server.ts`](../apps/web/src/lib/analytics/server.ts) with `posthog-node`, straight to PostHog with GeoIP off.

## Consent

[c15t](https://c15t.com) handles consent. Its banner, preferences dialog, and preferences list are in [`apps/web/src/components/consent/`](../apps/web/src/components/consent/), adapted from c15t's shadcn registry to use this repo's components. "Privacy settings" in the footer and the command menu reopens the dialog.

### Who sees the banner

The policy is in [`apps/web/src/lib/consent/backend-config.ts`](../apps/web/src/lib/consent/backend-config.ts):

| Where | What happens |
| --- | --- |
| The EEA, UK, Switzerland, Gibraltar, and unknown locations | Opt-in. Nothing optional runs until the visitor chooses |
| Quebec | Opt-in |
| US privacy states | Opt-out |
| Everywhere else | No banner. Analytics are on, and Privacy settings can turn them off |

Location comes from Vercel's geo headers on the consent request. Locally there are none, so the opt-in banner always shows.

### How it gates PostHog

PostHog starts opted out with `cookieless_mode: 'on_reject'`. [`apps/web/c15t.config.ts`](../apps/web/c15t.config.ts) registers a callback-only script in the `measurement` category that calls `opt_in_capturing()` or `opt_out_capturing()` whenever consent changes.

- **No choice yet, or declined:** PostHog counts the visit in cookieless mode. It stores nothing on the device and records no replays. PostHog tells visits apart with a server-side hash of the IP and browser and a salt that changes daily. The PostHog project needs cookieless tracking turned on for these events to be kept.
- **Accepted:** the full setup above, with the visitor ID in localStorage.

The dialog only lists Necessary and Analytics, because nothing else registers a category.

### The backend

The c15t backend runs inside the app at `/api/c15t` ([`apps/web/src/app/api/c15t/[[...path]]/route.ts`](../apps/web/src/app/api/c15t/[[...path]]/route.ts)) in `hosted()` mode. The browser asks it which policy applies, so pages stay static and `resolveConsent()` is never called on the server.

- Records go to the `c15t` schema in the same Neon database, away from Drizzle's `public` tables. See [Database](database.md#consent-records).
- IP addresses are not stored (`ipAddress.tracking: false`). The user agent, language, country and region, and how the choice was made are, as proof of it.
- Neon's pooled host rejects the `search_path` option c15t uses, so the backend connects to the direct host it derives from `DATABASE_URL`. Set `C15T_DATABASE_URL` to use another database.
- `@c15t/backend` is in `serverExternalPackages`, so Turbopack doesn't try to bundle its optional MySQL and SQLite drivers.

## The admin dashboards

The analytics pages in the admin read from PostHog and the database. See [Admin](admin.md#analytics).

- PostHog queries run through its query API with `POSTHOG_PERSONAL_API_KEY`, against `POSTHOG_PROJECT_ID`, filtered to this site's hosts plus the server events. They're cached for five minutes. The queries are in [`apps/web/src/lib/admin-analytics/posthog.ts`](../apps/web/src/lib/admin-analytics/posthog.ts).
- Database numbers come from [`apps/web/src/lib/admin-analytics/database.ts`](../apps/web/src/lib/admin-analytics/database.ts).
- Without the PostHog key, its panels say so and the database panels still work.

The personal API key needs the Query: Read scope, limited to the site's project.

## Keeping the privacy policy honest

[`/privacy-policy`](https://anishshobithps.com/privacy-policy) describes all of this from a visitor's side: what each tool records, the cookieless fallback, the consent record, and the one cookie the site sets itself. Change it in the same commit when you add an event that records something new, change the consent policy, or add a tool.
