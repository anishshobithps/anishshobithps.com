<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg"/>
    <img alt="anishshobithps.com" src=".github/banner-light.svg" width="100%"/>
  </picture>
</p>

Source code for [anishshobithps.com](https://anishshobithps.com) — a personal portfolio and blog. Built with Next.js 16, Fumadocs, Drizzle ORM, Clerk, and a slightly over-engineered PDF viewer.

---

## Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)             |
| Language    | TypeScript 5                                   |
| UI          | React 19, Tailwind CSS v4, shadcn/ui, Radix UI |
| Animation   | Motion (Framer Motion)                         |
| Icons       | Tabler Icons                                   |
| Blog / MDX  | Fumadocs Core + UI 16, fumadocs-mdx            |
| Database    | Drizzle ORM + Neon (PostgreSQL, serverless)    |
| Auth        | Clerk                                          |
| Resume      | react-pdf, GitHub Releases                     |
| Analytics   | Umami Analytics (production only)              |
| Now Playing | Spotify Web API                                |
| OG Images   | @takumi-rs/image-response                      |
| Linting     | ESLint 10, eslint-config-next                  |

---

## Prerequisites

- **Bun** (recommended) or **Node.js** 22 or later
- A **[Neon](https://neon.tech)** PostgreSQL database (or any PostgreSQL connection string)
- A **[Clerk](https://clerk.com)** application (for guestbook and blog comments auth)

---

## Auth Setup (Clerk)

The guestbook and blog comments require a [Clerk](https://clerk.com) account.

1. Create a new application at [dashboard.clerk.com](https://dashboard.clerk.com).
2. Enable the sign-in providers you want (Google, GitHub, etc.) in the **User & Authentication** settings.
3. Copy your **Publishable Key** and **Secret Key** from the Clerk dashboard → **API Keys** tab.
4. Get your **user ID** (for the site owner / admin role):
   - Sign in to your app once with the account you want to be the owner.
   - Find your user in Clerk dashboard → **Users** and copy the `user_xxx` ID.
5. Set up a **webhook** so guestbook and comment data is cleaned up when a user deletes their account:
   - In the Clerk dashboard → **Webhooks**, create a new endpoint pointing to `https://yourdomain.com/api/webhooks/clerk`.
   - Subscribe to the `user.deleted` event.
   - Copy the **Signing Secret** (`whsec_...`) and add it as `CLERK_WEBHOOK_SECRET` in `.env.local`.
6. Add all keys to `.env.local` (see [Environment Variables](#environment-variables) below).

The owner user ID (`OWNER_CLERK_USER_ID`) grants admin capabilities on the guestbook and blog comments: pinning entries, pinning comments, and deleting any message or comment.

---

## Environment Variables

Create a `.env.local` file at the project root:

```env
# Required — PostgreSQL connection string (Neon or any Postgres)
DATABASE_URL=postgresql://user:password@host/dbname

# Optional — salt for SHA-256 IP hashing (blog reads/reactions).
# Defaults to "blog-salt" if omitted. Set a strong random value in production.
IP_HASH_SALT=some-random-secret

# Required for Spotify now-playing widget in the footer.
# See scripts/get-spotify-refresh-token.ts for the one-time setup flow.
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REFRESH_TOKEN=

# Required for the guestbook and blog comments (Clerk auth).
# Get these from: https://dashboard.clerk.com → your app → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Your own Clerk user ID — grants admin powers on the guestbook and blog comments.
# Sign in once, then copy your user_xxx ID from the Clerk dashboard → Users.
OWNER_CLERK_USER_ID=user_...

# Required for the Clerk webhook (cleans up data when a user is deleted).
# Get this from: Clerk dashboard → Webhooks → your endpoint → Signing Secret
CLERK_WEBHOOK_SECRET=whsec_...

# Optional — base URL override. Auto-detected from Vercel env otherwise.
NEXT_PUBLIC_BASE_URL=https://anishshobithps.com
```

---

## Getting Started

```bash
# Install dependencies
bun install          # recommended — used in this project
npm install
pnpm install
yarn

# Push the database schema (creates tables on first run)
bun run drizzle-kit push

# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other Commands

```bash
bun run build       # drizzle-kit push + next build
bun start           # Start production server
bun run types:check # Generate fumadocs types + tsc --noEmit
bun run lint        # Run ESLint

# Same commands work with npm run / pnpm / yarn
```

---

## Key Features

- **Blog** with read counts, mood reactions (stored as hashed IPs — no raw PII), threaded comments, comment likes, and comment pinning
- **Guestbook** with Clerk auth — visitors can sign in, leave messages, and like entries; site owner can pin and moderate
- **Spotify now-playing** widget in the footer — shows current or last played track via the Spotify Web API (server-side, 60s cache, no visitor data sent)
- **PDF resume viewer** via react-pdf, proxied from GitHub Releases
- **OG image generation** per page and per blog post
- **Full-text search** via Fumadocs built-in search
- **Dark mode** with system preference detection
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Structured data** — JSON-LD for Person, WebSite, WebPage, BlogPosting, BreadcrumbList

---

## Database

Schema is managed with Drizzle ORM. Tables:

- `blog_reads` — unique read per (slug, ip_hash)
- `blog_reactions` — mood vote per (slug, ip_hash): one of `not-for-me | meh | liked-it | loved-it`
- `blog_comments` — threaded comments per blog post (Clerk user ID, body, parent_id, is_pinned, soft-delete via is_deleted)
- `blog_comment_likes` — per-comment likes keyed by Clerk user ID
- `guestbook_entries` — signed-in user messages (Clerk user ID, message, is_pinned, soft-delete via is_deleted)
- `guestbook_likes` — per-entry likes keyed by Clerk user ID

---

## Guestbook

The `/guestbook` page lets visitors leave a message after signing in with Clerk.

**Features:**

- Sign in via Clerk modal — redirects back to `/guestbook` after sign-in or sign-up
- Submit and delete your own messages
- Like any entry
- Site owner (matched by `OWNER_CLERK_USER_ID`) can pin entries and delete any message

**Setup checklist:**

1. Complete [Auth Setup](#auth-setup-clerk) above
2. Ensure `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `OWNER_CLERK_USER_ID` are all set in `.env.local`

Run `bun run drizzle-kit push` to apply schema changes. Migration files live in `drizzle/`.

---

## Blog Comments

Each blog post has a threaded comment section powered by Clerk auth.

**Features:**

- Sign in via Clerk modal to comment
- Threaded replies (one level deep)
- Like any comment
- Site owner (matched by `OWNER_CLERK_USER_ID`) can pin comments and delete any comment
- Deleted comments are soft-deleted — text is hidden but record is retained for referential integrity

**Setup checklist:**

1. Complete [Auth Setup](#auth-setup-clerk) above
2. Ensure `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `OWNER_CLERK_USER_ID` are all set in `.env.local`

---

## Deploy

Designed for **[Vercel](https://vercel.com)**. Set the environment variables in the Vercel dashboard. The `DATABASE_URL` must point to a serverless-compatible PostgreSQL endpoint (Neon recommended).

The build command (`bun run build`) runs `drizzle-kit push` before `next build`, so schema is always up to date on deploy.
