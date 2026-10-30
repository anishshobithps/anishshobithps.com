---
license: CC-BY-NC-ND-4.0
---

# Forking

Fork the machinery, not the words.

## What a fork can and can't do

A fork can keep, modify, and redistribute the MIT code. It can't publish modified versions of the CC BY-NC-ND writing and art, and it can't use my name, logo, or mascot as its own branding. If a fork keeps any of that writing or art unmodified, CC BY-NC-ND 4.0 still applies to it. Forking doesn't turn it into MIT.

[`LICENSE.md`](../LICENSE.md) spells out where the line falls, how to attribute, and what a fork may keep. The prose in `README.md` and in these docs counts as writing, so a fork should write its own.

## Before a fork goes live

- [ ] Delete `apps/web/content/blog/` and write your own posts. See [Writing posts](writing-posts.md).
- [ ] Update [`packages/site-config/src/index.ts`](../packages/site-config/src/index.ts): name, domain, email, socials, repo, resume URL, `availableForHire`.
- [ ] Replace the logo and mascot (`logo.tsx`, `logo-icon.tsx`, `logo-mascot.tsx`) and `apps/web/public/favicon-*.svg`.
- [ ] Replace or remove the doodles, page scenes, blog covers, and the OG card design. The isometric engine in `packages/iso/src/` stays, so draw your own with it. See [The art](art.md).
- [ ] Change the fallback name, domain, and role in [`apps/web/src/app/og/route.tsx`](../apps/web/src/app/og/route.tsx).
- [ ] Remove the photographs: `apps/web/public/profile.avif`, and `apps/web/src/lib/svg/media/profile-banner.webp`, which the `/svg` banner card uses.
- [ ] Remove the README artwork in `.github/` (`banner-*.svg`, `license-*.svg`).
- [ ] Check the license of `apps/web/public/fonts/LastoriaBoldRegular.otf` (the signature font) before shipping it.
- [ ] Write your own privacy policy in `apps/web/src/app/(site)/privacy-policy/page.tsx`. This one describes my setup, and it lists the services I use.
- [ ] Point the CSP, Clerk domain, and redirects in [`next.config.mjs`](../apps/web/next.config.mjs) at your own. See [Deployment](deployment.md).
- [ ] Edit the seed data in `apps/web/scripts/seed-links.ts`, which holds my links.
- [ ] Rewrite the README and these docs in your own words.

## What can stay

- The code, which is MIT. Keep the copyright notice.
- The UI sounds in `packages/sounds/src/sounds/`, which come from [soundcn](https://www.soundcn.xyz/) and are CC0 by Kenney. Keep them or swap them. See [Sound](sound.md).
- The shadcn primitives in `packages/ui/src/components/`, under their own MIT license.

Third-party material keeps its own license, as `LICENSE.md` lists.
