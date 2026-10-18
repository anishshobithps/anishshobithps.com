---
license: CC-BY-NC-ND-4.0
---

# Deployment

The site runs on Vercel, with Neon for the database, Clerk for sign-in, and a few services that are optional. These are the steps and the things that bite on a fresh deploy.

<div align="center">

[![Vercel](https://www.shieldcn.dev/badge/Vercel-000000.svg?logo=vercel&logoColor=fff&variant=branded&size=sm)](https://vercel.com) [![Neon](https://www.shieldcn.dev/badge/Neon-34D59A.svg?logo=neon&logoColor=000&variant=branded&size=sm)](https://neon.tech) [![Clerk](https://www.shieldcn.dev/badge/Clerk-6C47FF.svg?logo=clerk&logoColor=fff&variant=branded&size=sm)](https://clerk.com) [![Spotify](https://www.shieldcn.dev/badge/Spotify-1DB954.svg?logo=spotify&logoColor=fff&variant=branded&size=sm)](https://developer.spotify.com) [![Cloudinary](https://www.shieldcn.dev/badge/Cloudinary-3448C5.svg?logo=cloudinary&logoColor=fff&variant=branded&size=sm)](https://cloudinary.com) [![Umami](https://www.shieldcn.dev/badge/Umami-000000.svg?logo=umami&logoColor=fff&variant=branded&size=sm)](https://umami.is)

</div>

## Steps

1. Import the repository into Vercel. It's a standard Next.js project, so the defaults work.
2. Add the environment variables from [Getting started](getting-started.md#environment-variables) for the Production environment. `NEXT_PUBLIC_*` values are inlined at build time, so changing one needs a new deploy.
3. Point `DATABASE_URL` at your Neon database, then run the migrations against it yourself (see below).
4. In Clerk, create a production instance, set its keys, and add the webhook for `user.deleted` at `https://<your-domain>/api/webhooks/clerk`.
5. Deploy, then run through the [checklist](#after-the-first-deploy).

## Migrations

The build runs `next build` only. It never migrates. When the schema changes, run `pnpm db:migrate` against the production database yourself, ideally before the new code goes live. See [Database](database.md#migrations).

## Three things that bite on a fresh deploy

- **The CSP names my Clerk domain.** The policy in [`next.config.mjs`](../next.config.mjs) hardcodes `clerk.anishshobithps.com`, so point it at your own Clerk frontend domain, or sign-in scripts get blocked.
- **Remote images need an entry.** `next/image` only optimises hosts in `images.remotePatterns`. That's `discord.com`, `res.cloudinary.com`, and `img.clerk.com` today. Add any new host there. `img-src` in the CSP already allows any `https:` image, but `media-src` only allows this site and `res.cloudinary.com`, so video from anywhere else needs adding to the CSP.
- **A second short-link domain has to be on the same project.** If you use `SHORTLINK_DOMAIN`, add that domain to the same Vercel project, or the proxy never sees its requests. See [Short links](short-links.md#a-second-domain).

## What the config sets up

All of this is in `next.config.mjs`.

- **Security headers** on every route except `/svg`: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, a strict-origin referrer policy, a `Permissions-Policy` that turns off camera, microphone, and geolocation, and the Content-Security-Policy. `/svg` is excluded so its own sandboxed policy isn't replaced.
- **Analytics proxy.** `/stats/script.js` and `/stats/api/send` are rewritten to Umami Cloud, so the browser only talks to this domain. The script is only added in production builds.
- **Raw MDX.** `/blog/<slug>.mdx` is rewritten to `/llms.mdx/blog/<slug>`.
- **Redirects.** There's one for an old post title. Add one whenever you rename a post. See [Writing posts](writing-posts.md#publishing).
- **Typed routes** are on, so a link to a route that doesn't exist fails `pnpm types:check`.

## The third parties

What the browser contacts, because the CSP has to allow it:

| Service | What for |
| --- | --- |
| Clerk | Sign-in scripts, from your Clerk frontend domain, plus profile pictures from `img.clerk.com` |
| Cloudinary | Video in posts, only when it's played |

Everything else is fetched on the server: Spotify, the GitHub API, the resume PDF, Open-Meteo, and WakaTime. Fonts are self-hosted. The [privacy policy](https://anishshobithps.com/privacy-policy) describes this from a visitor's side, so keep it accurate if you add a service.

## After the first deploy

- The home page loads, and the now-playing line in the footer resolves.
- Sign in works, and a guestbook message posts.
- `/admin` opens for your account and not for anyone else's.
- Deleting a throwaway Clerk user removes its rows. Clerk's dashboard can send a test event to the webhook.
- `/feed.xml`, `/sitemap.xml`, and `/llms.txt` render.
- `/og?title=Hello` returns an image, and `/svg?type=banner&theme=dark` returns an SVG.
- `/resume` shows the PDF. Publish a new release and use the admin button to confirm the cache clears.
- With `SHORTLINK_DOMAIN` set, a slug resolves on that domain and `/blogs` there redirects to the main one.
