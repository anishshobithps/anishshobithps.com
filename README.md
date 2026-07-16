<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg"/>
    <img alt="anishshobithps.com" src=".github/banner-light.svg" width="100%"/>
  </picture>
</p>

Source code for [anishshobithps.com](https://anishshobithps.com): a portfolio, blog, and guestbook. Interfaces, bots, and questionable automation scripts, mostly so I don't have to repeat myself.

<div align="center">

[![GitHub Stars](https://www.shieldcn.dev/github/stars/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/stargazers) [![GitHub Forks](https://www.shieldcn.dev/github/forks/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/network/members) [![Last Commit](https://www.shieldcn.dev/github/last-commit/anishshobithps/anishshobithps.com.svg?variant=secondary&size=sm)](https://github.com/anishshobithps/anishshobithps.com/commits)

[![License](https://www.shieldcn.dev/group/badge/Code-MIT-22C55E%2Bbadge/Content-CC_BY--NC--ND_4.0-F97316.svg?size=sm)](LICENSE.md)

![Next.js](https://www.shieldcn.dev/badge/Next.js-000000.svg?logo=nextdotjs&logoColor=fff&variant=branded&size=sm) ![React](https://www.shieldcn.dev/badge/React-61DAFB.svg?logo=react&logoColor=000&variant=branded&size=sm) ![TypeScript](https://www.shieldcn.dev/badge/TypeScript-3178C6.svg?logo=typescript&logoColor=fff&variant=branded&size=sm) ![Tailwind CSS](https://www.shieldcn.dev/badge/Tailwind_CSS-06B6D4.svg?logo=tailwindcss&logoColor=fff&variant=branded&size=sm) ![Drizzle](https://www.shieldcn.dev/badge/Drizzle-C5F74F.svg?logo=drizzle&logoColor=000&variant=branded&size=sm) ![PostgreSQL](https://www.shieldcn.dev/badge/PostgreSQL-4169E1.svg?logo=postgresql&logoColor=fff&variant=branded&size=sm) ![pnpm](https://www.shieldcn.dev/badge/pnpm-F69220.svg?logo=pnpm&logoColor=fff&variant=branded&size=sm) ![ESLint](https://www.shieldcn.dev/badge/ESLint-4B32C3.svg?logo=eslint&logoColor=fff&variant=branded&size=sm)

</div>

---

## Running locally

```bash
pnpm install
pnpm drizzle-kit push   # sets up the database tables
pnpm dev                # http://localhost:3000
```

You'll need a few things first:

| What       | Where                                                     |
| ---------- | --------------------------------------------------------- |
| PostgreSQL | [neon.tech](https://neon.tech) (free tier works)          |
| Auth       | [clerk.com](https://clerk.com) (for guestbook & comments) |
| Spotify    | run `scripts/get-spotify-refresh-token.ts` once           |

Create `.env.local` at the root:

```env
DATABASE_URL=postgresql://...
IP_HASH_SALT=some-random-secret        # required — any long random string; keep it secret

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
OWNER_CLERK_USER_ID=user_...           # your user ID = admin powers
CLERK_WEBHOOK_SECRET=whsec_...         # Clerk > Webhooks > Signing Secret

NEXT_PUBLIC_BASE_URL=https://anishshobithps.com
NEXT_PUBLIC_UMAMI_WEBSITE_ID=...       # optional, or remove from layout.tsx
```

**Clerk webhook:** point `https://yourdomain.com/api/webhooks/clerk` at `user.deleted` to keep the DB clean when users delete their accounts.

---

## Commands

```bash
pnpm build        # next build
pnpm start        # production server
pnpm types:check  # tsc --noEmit
pnpm lint         # ESLint
```

---

## Deploy

<div align="center">

[![Vercel](https://www.shieldcn.dev/badge/Vercel-000000.svg?logo=vercel&logoColor=fff&variant=branded&size=sm)](https://vercel.com) [![Neon](https://www.shieldcn.dev/badge/Neon-34D59A.svg?logo=neon&logoColor=000&variant=branded&size=sm)](https://neon.tech) [![Clerk](https://www.shieldcn.dev/badge/Clerk-6C47FF.svg?logo=clerk&logoColor=fff&variant=branded&size=sm)](https://clerk.com) [![Spotify](https://www.shieldcn.dev/badge/Spotify-1DB954.svg?logo=spotify&logoColor=fff&variant=branded&size=sm)](https://developer.spotify.com) [![Cloudinary](https://www.shieldcn.dev/badge/Cloudinary-3448C5.svg?logo=cloudinary&logoColor=fff&variant=branded&size=sm)](https://cloudinary.com) [![Umami](https://www.shieldcn.dev/badge/Umami-000000.svg?logo=umami&logoColor=fff&variant=branded&size=sm)](https://umami.is)

</div>

Add the env vars, point `DATABASE_URL` at Neon, done. The build command runs `drizzle-kit push` before `next build`, so schema is always up to date on deploy.
