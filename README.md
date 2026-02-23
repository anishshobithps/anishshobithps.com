<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/banner-dark.svg"/>
    <img alt="anishshobithps.com" src=".github/banner-light.svg" width="100%"/>
  </picture>
</p>

Source code for [anishshobithps.com](https://anishshobithps.com) — a personal portfolio and blog. Built with Next.js 16, Fumadocs, Drizzle ORM, and a slightly over-engineered PDF viewer.

---

## Tech Stack

| Layer       | Technology                                     |
| ----------- | ---------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack)             |
| Language    | TypeScript 5                                   |
| UI          | React 19, Tailwind CSS v4, shadcn/ui, Radix UI |
| Icons       | Lucide React, Tabler Icons                     |
| Blog / MDX  | Fumadocs Core + UI 16, fumadocs-mdx            |
| Database    | Drizzle ORM + Neon (PostgreSQL, serverless)    |
| Resume      | react-pdf, GitHub Releases                     |
| Analytics   | Umami Analytics (production only)              |
| Now Playing | Spotify Web API                                |
| OG Images   | @takumi-rs/image-response                      |
| Linting     | ESLint 10, eslint-config-next                  |

---

## Prerequisites

- **Bun** (recommended) or **Node.js** 22 or later
- A **[Neon](https://neon.tech)** PostgreSQL database (or any PostgreSQL connection string)

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

## Project Structure

```
src/
  app/                    # Next.js App Router
    _components/          # Home page sections (hero, projects, ecosystem, rules, contact)
    blog/[[...slug]]/     # Dynamic blog post page
    blogs/                # Blog listing page
    branding/             # Branding / logo assets page
    resume/               # PDF resume viewer
    og/                   # OG image generation route
    api/
      resume/             # Resume download proxy
      search/             # Fumadocs search route handler
  components/
    layouts/              # Page, Blog, BlogNav layout shells
    shared/               # Header, Footer, JSON-LD, OG, theme toggle
    ui/                   # Design system components (Badge, Button, Typography, etc.)
  lib/
    config.ts             # Site-wide configuration (name, links, nav)
    db.ts                 # Drizzle + Neon client
    schema.ts             # Database schema (blog_reads, blog_reactions)
    ip.ts                 # SHA-256 IP hashing
    og.ts                 # Metadata / OG helpers
    source.ts             # Fumadocs content source adapter
    resume.ts             # Resume fetch + cache
    spotify.ts            # Spotify Web API client (now-playing)
content/
  blog/                   # MDX blog posts
drizzle/                  # Migration files
public/                   # Static assets (favicon, cursors, profile image)
source.config.ts          # Fumadocs MDX config + frontmatter schema
```

---

## Key Features

- **Blog** with read counts and mood reactions (stored as hashed IPs — no raw PII)
- **Spotify now-playing** widget in the footer — shows current or last played track via the Spotify Web API (server-side, 60s cache, no visitor data sent)
- **PDF resume viewer** via react-pdf, proxied from GitHub Releases
- **OG image generation** per page and per blog post
- **Full-text search** via Fumadocs built-in search
- **Dark mode** with system preference detection
- **Security headers** — CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy
- **Structured data** — JSON-LD for Person, WebSite, BlogPosting, BreadcrumbList

---

## Database

Schema is managed with Drizzle ORM. Two tables:

- `blog_reads` — unique read per (slug, ip_hash)
- `blog_reactions` — mood vote per (slug, ip_hash): one of `not-for-me | meh | liked-it | loved-it`

Run `bun run drizzle-kit push` to apply schema changes. Migration files live in `drizzle/`.

---

## Deploy

Designed for **[Vercel](https://vercel.com)**. Set the environment variables in the Vercel dashboard. The `DATABASE_URL` must point to a serverless-compatible PostgreSQL endpoint (Neon recommended).

The build command (`bun run build`) runs `drizzle-kit push` before `next build`, so schema is always up to date on deploy.
