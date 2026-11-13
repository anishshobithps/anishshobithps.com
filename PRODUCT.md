# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences with equal weight:

- **People deciding whether to hire or work with Anish.** Recruiters and engineering leads who land on the home page, the resume, or the projects list and need to judge skill and reach out quickly.
- **Developers reading the writing.** Engineers who arrive from a shared post, search, or RSS, read one article, and maybe react, comment, or sign the guestbook.

When a decision serves one audience at the other's expense, find the version that serves both rather than ranking them.

## Product Purpose

anishshobithps.com is Anish Shobith P S's personal site: a portfolio, a blog, and a guestbook, run from one Next.js app in a pnpm and Turborepo workspace. It exists to get Anish hired, to get the writing read, to show the craft through the site itself, and to give Anish a place to try ideas in public.

Success over the next year:

- Inbound job offers through the contact section and the resume.
- Posts that get read and shared, measured by views, reactions, comments, and RSS.
- The site works as a craft showcase: the details are the portfolio piece.
- It stays a sandbox where new tools and ideas can ship without ceremony.

## Positioning

The site is the evidence. Its illustrations are drawn in code from real data, its interface carries working details (command palette, draggable quick menu, opt-in UI sounds, generated OG and README cards), and its source is public. A neighbouring portfolio can list the same stack; it cannot claim this particular body of work, this writing, or this source.

## Operating Context

- Hiring visitors usually take the path: home, resume (PDF streamed from the latest GitHub release of `anishshobithps/resume`), projects, contact.
- Readers arrive on `/blog/*` directly, often on phones, and may sign in with Clerk to comment.
- The guestbook and blog comments need Clerk sign-in; reactions and view counts are anonymous, keyed by a salted IP hash.
- `/svg` cards are embedded in GitHub READMEs and `/og` cards appear in link previews, so the brand travels outside the site.
- Anish runs the site alone through an owner-only `/admin`: moderation, project ordering, short links, and the resume cache.

## Capabilities and Constraints

- Routes: `/`, `/projects`, `/blogs`, `/blog/*`, `/resume`, `/guestbook`, `/branding`, `/privacy-policy`, `/admin/*`, plus `/og`, `/svg`, `/feed.xml`, `/llms.txt`, and short links at `/<slug>` and `/<tag>/<slug>`. See `docs/architecture.md`.
- Posts are MDX through fumadocs. Projects and short links live in Postgres (Neon, Drizzle) and are edited from the admin, never hardcoded.
- Everything that shows content must keep working as posts, projects, and guestbook entries grow or shrink, including zero.
- A failed database read degrades to a fallback value through `safeQuery`; it never breaks a page.
- UI sounds stay off until a visitor turns them on. Motion respects `prefers-reduced-motion`.
- `/photos` exists behind a dev-only feature flag and is not launched.
- `siteConfig.availableForHire` toggles the hire sign; hiring messaging must disappear cleanly when it is false.

## Brand Commitments

- **Name and identity:** Anish Shobith P S, handle `n10nce`, domain anishshobithps.com, role "Software Developer". The name, domain, likeness, photograph, and brand identity are reserved; the logo, wordmark, and mascot are CC BY-NC-ND 4.0 artwork, not licensed as branding.
- **Voice:** first person, dry, and self-deprecating, with plain claims. The anchor line is "I build interfaces and tooling, the occasional bot, and questionable automation scripts, mostly so I don't have to repeat myself." Small jokes are welcome ("Will ship for ice cream"); hype is not.
- **Copy habits:** labels are worded so they need no "·" separator.
- **Illustration language:** the owner chose a two-ink riso print language for all artwork; `docs/art.md` is binding for it. The previous tonal isometric machine look and dimension-drawing work were rejected and must not return.
- **Licensing is mixed by design:** code MIT, writing and art CC BY-NC-ND 4.0. See `LICENSE.md`.

## Evidence on Hand

- Four published posts in `apps/web/content/blog/`: the emoji architecture post, the machine-readable resume post, the RCB ticket alert system, and the first-code story.
- The profile photograph at `apps/web/public/profile.avif`.
- The live resume PDF from the GitHub release behind `siteConfig.resumeURL`.
- Projects, guestbook entries, reactions, views, and comments are real rows in Postgres; show them as they are.
- The public repository and its docs in `docs/`.

There are no testimonials, client logos, case studies, employer endorsements, or traffic figures on hand. Do not invent them, and do not invent project outcomes or metrics.

## Product Principles

1. **Show, don't claim.** Prove skill with working detail and real data instead of adjectives or skill bars.
2. **Two audiences, one site.** A hiring manager reaches the resume and contact in seconds; a reader gets an article worth staying in. Neither path gets in the other's way.
3. **Real content only.** Every figure, list, and count comes from the actual posts, projects, and visitors, and must hold up at zero and at many.
4. **Delight is opt-in and quiet.** Sounds, motion, and easter eggs never cost a visitor time, attention they didn't offer, or access.
5. **Room to experiment.** New ideas can ship behind a flag and be removed without leaving residue.

## Accessibility & Inclusion

WCAG 2.2 AA is a hard floor on every public page and the admin, in both light and dark themes. Existing commitments stay: reduced-motion support, sounds off by default, keyboard access to the command palette and quick menu, and alt text on content images.
