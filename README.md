<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg"/>
    <img alt="anishshobithps.com banner: Anish Shobith P S, the source for a portfolio, blog, and guestbook. An isometric drawing shows the logo mascot standing on slabs labelled Postgres, Next.js, and React." src=".github/banner-light.svg" width="100%"/>
  </picture>
</p>

<p align="center">
  <a href="https://anishshobithps.com">Live site</a> /
  <a href="https://anishshobithps.com/blogs">Blog</a> /
  <a href="https://anishshobithps.com/feed.xml">RSS</a> /
  <a href="https://anishshobithps.com/branding">Branding</a> /
  <a href="https://anishshobithps.com/privacy-policy">Privacy</a>
</p>

Source code for [anishshobithps.com](https://anishshobithps.com): a portfolio, blog, and guestbook. Interfaces, bots, and questionable automation scripts, mostly so I don't have to repeat myself.

<div align="center">

[![GitHub Stars](https://www.shieldcn.dev/github/stars/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/stargazers) [![GitHub Forks](https://www.shieldcn.dev/github/forks/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/network/members) [![Last Commit](https://www.shieldcn.dev/github/last-commit/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/commits)

[![License](https://www.shieldcn.dev/group/badge/Code-MIT-22C55E%2Bbadge/Writing_%26_art-CC_BY--NC--ND_4.0-F97316%2Bbadge/Brand-Reserved-71717A.svg?size=sm)](LICENSE.md)

![Next.js](https://www.shieldcn.dev/badge/Next.js_16-000000.svg?logo=nextdotjs&logoColor=fff&variant=branded&size=sm) ![React](https://www.shieldcn.dev/badge/React_19-61DAFB.svg?logo=react&logoColor=000&variant=branded&size=sm) ![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=fff&variant=branded&size=sm) ![Tailwind CSS](https://www.shieldcn.dev/badge/Tailwind_CSS_4-06B6D4.svg?logo=tailwindcss&logoColor=fff&variant=branded&size=sm) ![Drizzle](https://www.shieldcn.dev/badge/Drizzle-C5F74F.svg?logo=drizzle&logoColor=000&variant=branded&size=sm) ![PostgreSQL](https://www.shieldcn.dev/badge/PostgreSQL-4169E1.svg?logo=postgresql&logoColor=fff&variant=branded&size=sm) ![pnpm](https://www.shieldcn.dev/badge/pnpm-F69220.svg?logo=pnpm&logoColor=fff&variant=branded&size=sm) ![ESLint](https://www.shieldcn.dev/badge/ESLint-4B32C3.svg?logo=eslint&logoColor=fff&variant=branded&size=sm)

</div>

> ### License at a glance
>
> - **Functional code**, including the code examples in this README, the docs, and blog posts: MIT
> - **Writing, original artwork, and creative copy**, including the prose in this README and in [`docs/`](docs/README.md): CC BY-NC-ND 4.0
> - **Logo, wordmark, and mascot:** CC BY-NC-ND 4.0 as artwork, not licensed as branding
> - **Name, domain, likeness, photograph, and brand identity:** reserved
> - **Third-party material:** its original license
>
> This repository is intentionally mixed-license, and so are this README and the docs. See [`LICENSE.md`](LICENSE.md) for the exact scope.

---

## What's in here

- A portfolio and a blog. Posts are MDX with isometric covers, reading time, anonymous reactions, view counts, and threaded comments.
- A guestbook and blog comments behind Clerk sign-in, with likes, pinning, and soft delete.
- Projects and short links that live in Postgres and are managed from an owner-only admin.
- A resume rendered inline from the latest GitHub release.
- `/svg` cards for GitHub READMEs, `/og` cards for link previews, and an RSS feed.
- Artwork drawn in code rather than exported: the isometric scenes, mascot, doodles, and OG card.
- A command palette, a draggable quick menu, and optional UI sounds that stay off until a visitor turns them on.

The full route list is in [Architecture](docs/architecture.md#routes).

---

## Quick start

Node 22+ and pnpm 11 (the repo pins `packageManager`, so `corepack enable` is enough).

```bash
pnpm install
pnpm db:migrate         # applies the committed migrations in packages/db/drizzle/
pnpm dev                # http://localhost:3000
```

Create `.env.local` first. `DATABASE_URL` (a [Neon](https://neon.tech) database) and `IP_HASH_SALT` are the two you can't skip, and sign-in needs [Clerk](https://clerk.com) keys. [Getting started](docs/getting-started.md) has the full variable list, the Clerk webhook, and the Spotify token script.

---

## Documentation

| | |
| --- | --- |
| [Getting started](docs/getting-started.md) | Requirements, environment variables, Clerk, Spotify, seeding |
| [Architecture](docs/architecture.md) | Routes, request flow, caching, project layout |
| [Database](docs/database.md) | Tables, anonymous identity hashing, migrations |
| [Development](docs/development.md) | Commands, tests, lint, CI, and the conventions the code follows |
| [Writing posts](docs/writing-posts.md) | Frontmatter, MDX components, covers, publishing |
| [Admin](docs/admin.md) | Access, moderation, projects, links, the resume cache |
| [Short links](docs/short-links.md) | Shapes, previews, reserved paths, a second domain |
| [SVG cards](docs/svg-cards.md) | The `/svg` endpoint, every template, how it's built |
| [The art](docs/art.md) | The isometric engine, scenes, mascot, OG cards, colour tokens |
| [Sound](docs/sound.md) | Opt-in UI sounds: principles, the sound map, adding a sound |
| [Deployment](docs/deployment.md) | Vercel, Neon, Clerk, headers, the first-deploy checklist |
| [Forking](docs/forking.md) | What a fork can keep and what to replace before going live |

---

## Forking

Fork the machinery, not the words. A fork can keep, modify, and redistribute the MIT code. It can't publish modified versions of the CC BY-NC-ND writing and art, and it can't use my name, logo, or mascot as its own branding. If a fork keeps any of that writing or art unmodified, CC BY-NC-ND 4.0 still applies to it. Forking doesn't turn it into MIT.

The checklist of what to replace before a fork goes live is in [Forking](docs/forking.md).

---

## License

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/license-dark.svg"/>
    <img alt="Fork the machinery, not the words. Code is MIT; writing and artwork are CC BY-NC-ND 4.0; the brand is reserved. The waving mascot stands between a crate labelled MIT, marked take this, and a crate labelled CC, marked not this." src=".github/license-light.svg" width="100%"/>
  </picture>
</p>

Code is [MIT](LICENSE.md), including the code blocks in this README and in blog posts. The prose and artwork (including artwork drawn in code) are [CC BY-NC-ND 4.0](LICENSE.md). Some brand assets, like the logo and mascot, are also covered by that copyright license, but their use as a name, logo, identity, or endorsement is not licensed. [`LICENSE.md`](LICENSE.md) spells out where the line falls, how to attribute, and what a fork may keep. None of it licenses my name, likeness, or brand identity for use as your own.
