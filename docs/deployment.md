---
license: CC-BY-NC-ND-4.0
---

# Deployment

The site runs on Vercel with Neon and Clerk. This page covers the first deploy, what the config sets up, and what a fork has to replace.

## Steps

1. Import the repository into Vercel with the Root Directory at the repo root. `vercel.json` builds with `turbo run build --filter=web` and reads `apps/web/.next`.
2. Add the variables from [`apps/web/.env.schema`](../apps/web/.env.schema) for Production and Preview. `NEXT_PUBLIC_*` values are inlined at build, so changing one needs a new deploy.
3. Run `pnpm db:migrate` and `pnpm db:consent:migrate` against the production database yourself. The build never migrates.
4. varlock encrypts the resolved env into the build, so it fails on purpose until `_VARLOCK_ENV_KEY` is set:

   ```bash
   vercel env add _VARLOCK_ENV_KEY production --sensitive --yes --value "$(apps/web/node_modules/.bin/varlock generate-key --plain)"
   ```

5. Create a Clerk production instance, set its keys, and add the `user.deleted` webhook.
6. For PostHog, add your domain as an authorized URL and turn on session replay, heatmaps, and cookieless tracking. Without cookieless tracking it drops events from visitors who haven't accepted.

When the schema changes later, run `pnpm db:migrate` against production before the new code goes live. Run `pnpm db:consent:plan` after upgrading c15t to see if its tables need migrating too.

## What bites on a fresh deploy

- **The CSP names my Clerk domain.** `apps/web/next.config.mjs` hardcodes `clerk.anishshobithps.com`. Point it at yours, or sign-in scripts are blocked.
- **Remote images need an entry** in `images.remotePatterns`, and video from anywhere but Cloudinary needs adding to `media-src`.
- **A short-link domain has to be on the same Vercel project**, or the proxy never sees its requests.

## What the config sets up

All in `apps/web/next.config.mjs`:

- **Security headers** on every route except `/svg`: frame, content-type, and referrer policies, a `Permissions-Policy` that turns off camera, microphone, and geolocation, and the CSP.
- **Analytics rewrites.** `/stats/*` goes to Umami Cloud and `/relay/*` to PostHog, so the browser only talks to this domain.
- **The consent backend.** `@c15t/backend` is a server external package, and `withConsentManifest` wraps the config.
- **Raw MDX.** `/blog/<slug>.mdx` rewrites to `/llms.mdx/blog/<slug>`.
- **Redirects** for renamed posts.

The browser contacts only Clerk, Cloudinary for video when it plays, and linked sites for link-card thumbnails, sent without a referrer. Everything else is fetched on the server, and fonts are self-hosted. Keep the [privacy policy](https://anishshobithps.com/privacy-policy) accurate when you add a service.

## After the first deploy

- The home page loads, and now playing resolves in the footer.
- Sign-in works, a guestbook message posts, and `/admin` opens for you and nobody else.
- Deleting a throwaway Clerk user removes its rows.
- `/feed.xml`, `/sitemap.xml`, `/llms.txt`, `/og?title=Hello`, and `/svg?type=banner&theme=dark` render.
- `/resume` shows the PDF, and the admin button clears it after a new release.
- With `SHORTLINK_DOMAIN` set, a slug resolves there and `/blogs` redirects to the main domain.
- `/api/c15t/status` returns 200, and in a private window from an opt-in region the banner appears and a choice survives a reload.
- The Network panel shows `/relay/` requests and none to `posthog.com`.

## Forking

Fork the machinery, not the words. The code is MIT. The writing and art are CC BY-NC-ND 4.0, so a fork can't publish modified versions of them, and the name, logo, and mascot can't be its branding. [`LICENSE.md`](../LICENSE.md) has the details.

Before a fork goes live:

- [ ] Replace `apps/web/content/blog/` with your own posts.
- [ ] Update [`packages/core/src/site-config.ts`](../packages/core/src/site-config.ts): name, domain, email, socials, repo, resume URL.
- [ ] Replace the logo and mascot in `packages/ui/src/brand/` and `apps/web/public/favicon-*.svg`.
- [ ] Replace or remove the doodles, scenes, covers, and OG card design. The print engine stays, so draw your own with it.
- [ ] Change the fallback name, domain, and role in `apps/web/src/app/og/route.tsx`.
- [ ] Remove the photographs: `apps/web/public/profile.avif` and `apps/web/src/lib/svg/media/profile-banner.webp`.
- [ ] Remove the README artwork in `.github/`.
- [ ] Check the license of `apps/web/public/fonts/LastoriaBoldRegular.otf` before shipping it.
- [ ] Write your own privacy policy in `apps/web/src/app/(site)/privacy-policy/page.tsx`.
- [ ] Point the CSP, Clerk domain, and redirects in `next.config.mjs` at your own.
- [ ] Edit the links in `apps/web/scripts/seed-links.ts`.
- [ ] Use your own PostHog project, change the `POSTHOG_PROJECT_ID` default in the schema, and check the consent copy in `apps/web/c15t.config.ts` and `apps/web/src/lib/consent/backend-config.ts`.
- [ ] Rewrite the README and these docs in your own words.

The code, the soundcn sounds (CC0), and the shadcn primitives (MIT) can stay. Third-party material keeps its own license.
