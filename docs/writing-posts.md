---
license: CC-BY-NC-ND-4.0
---

# Writing posts

Posts are MDX files in `content/blog/`. Adding one is a file and a push.

## The file

Drop an `.mdx` file in `content/blog/`. The filename is the slug, so `making-my-resume-machine-readable.mdx` is served at `/blog/making-my-resume-machine-readable`. Frontmatter is validated by [`source.config.ts`](../source.config.ts):

```yaml
---
title: The Hidden Architecture of Emoji
description: One or two sentences. Also used for the OG image, the RSS feed, and the meta description.
date: 2026-03-19
tags:
  - Unicode
  - Typography
lastModified: 2026-04-02
---
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | Yes | Shown in the header, cards, feed, and OG image |
| `description` | No, but write one | The meta description, the RSS summary, and the OG card text |
| `date` | No | Publication date. The blog index lists posts newest first by it |
| `tags` | No | Free-form strings, and the blog index filters by them |
| `lastModified` | No | Set it by hand when an edit is worth announcing |

`lastModified` is manual on purpose. It used to come from git history, but shallow clones on the deploy host re-dated every post on every push. The sitemap uses `lastModified`, then `date`.

Reading time is computed at build time by a remark plugin ([`src/lib/remarkReadingTime.ts`](../src/lib/remarkReadingTime.ts)).

## What you can use in a post

Everything `fumadocs-ui` provides by default for MDX works: headings, tables, callouts, cards, and fenced code with syntax highlighting (`github-light` and `github-dark`, following the site theme). Two more things are available without an import:

- `<TypographyMark>` and `<TypographyMuted>`
- The fumadocs tab components

Video goes through the media player in `src/components/ui/media-player.tsx`. Import it at the top of the post, and see an existing post for the pattern. Videos stream from Cloudinary, which needs `res.cloudinary.com` allowed in the CSP, and it already is. Images inside posts are served from this domain.

## The cover

Every post gets an isometric cover. To give a post its own scene, add its slug to the `covers` map in [`src/components/diagrams/blog-covers.tsx`](../src/components/diagrams/blog-covers.tsx), pointing at a scene from `src/lib/iso/scenes/`. A post without an entry gets the typewriter scene (`blogsScene`) until it has its own. See [The art](art.md) for how scenes are built.

## What a post gets for free

- A page at `/blog/<slug>` with reading time, a cover, and previous and next links.
- Anonymous reactions, a unique read count, and threaded comments. Rows are created the first time they're needed, and only for slugs that exist in `content/blog`.
- An entry in `/blogs`, `/feed.xml`, `/sitemap.xml`, and `/llms.txt`.
- Raw MDX at `/blog/<slug>.mdx`, for tools that want the source. The `/blogs/latest` route redirects to the newest post.
- An OpenGraph card from `/og`, built from the title and description.

## Publishing

1. Write the post and run `pnpm dev` to see it.
2. Run `pnpm types:check`. It validates frontmatter against the schema.
3. Push to `main`. Posts are compiled at build time, so a deploy is what publishes it.

Renaming a post changes its URL and orphans its reactions and comments, which are keyed by slug. Add a redirect in `next.config.mjs` when you rename one. There is already one there for an earlier title.

Prose in `content/` is CC BY-NC-ND 4.0, and code blocks in posts are MIT. See [`LICENSE.md`](../LICENSE.md).
