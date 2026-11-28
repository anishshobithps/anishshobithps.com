---
license: CC-BY-NC-ND-4.0
---

# Writing posts

A post is an `.mdx` file in `apps/web/content/blog/`, and the filename is its slug. Pushing to `main` publishes it.

## Frontmatter

Validated by [`apps/web/source.config.ts`](../apps/web/source.config.ts):

```yaml
---
title: The Hidden Architecture of Emoji
description: One or two sentences, used for the meta description, the feed, and the OG card.
date: 2026-03-19
tags:
  - Unicode
updates:
  - date: 2026-04-02
    kind: correction
    note: The 10:09 watch is the ⌚ emoji, not a clock face.
links:
  - url: https://github.com/anishshobithps/resume
    label: Resume source
    note: One line on why it matters.
    featured: true
  - https://exiftool.org/
---
```

| Field | Notes |
| --- | --- |
| `title` | Required |
| `description` | Write one |
| `date` | Publication date. The index sorts by it |
| `tags` | Free-form, and the index filters by them |
| `updates` | The revision log, below |
| `lastModified` | Overrides the date taken from `updates`. Rarely needed |
| `links` | The links a reader shouldn't miss, below |

The modified date is manual on purpose, because shallow clones on the deploy host made git dates wrong. It is the newest `updates` date, or `lastModified`.

## Revisions

`kind` is `correction`, `addition`, `sources`, or `edit` (the default). Write `note` for a reader, not as a commit message. Entries on the same date share a heading, so put corrections before sources.

A post with `updates` shows a "Revised" chip that opens the log. A returning reader who hasn't opened it since the latest entry sees a dot and "New for you" marks, kept in their browser only. Fix typos without logging them, and log a correction when the old text would have misled someone.

## Links

Each `links` entry is a URL, or an object with `url` and optional `label`, `note`, and `featured`. They show in a "Links" block beside the contents and in a grid before the end of the post. The first `featured` entry also gets a full card at the top. Leave `featured` off when no link is the post's source.

Cards are built on the server from the URL. GitHub, npm, YouTube, Wikipedia, Discord, and this site's own pages get rich cards, and anything else uses the page's own metadata. A link that can't be fetched falls back to a plain card with its host.

In the body, write `<LinkCard url="…" />`, or put a URL on a line of its own. External links in prose preview on hover.

## Citations

```md
The stadium runs at a reduced capacity of 28,000[^capacity].

[^capacity]: NewsX, [M Chinnaswamy New Guidelines For IPL 2026](https://www.newsx.com/…).
```

Numbers follow first appearance, and the definitions become a "Sources" list. Hovering a number previews the first `https` link in its definition, titled with the link text, so write the real title there.

## Components

Everything fumadocs provides for MDX works, with code highlighted in `github-light` and `github-dark`. Without an import you also get `<TypographyMark>`, `<TypographyMuted>`, the tab components, `<Steps>`, `<Files>`, and `<LinkCard>`.

Video goes through `@repo/ui/components/media-player`, imported at the top of the post, and streams from Cloudinary.

## Covers

Every post gets the numbered sheet, with a swipe of green unique to its slug. To give one its own scene, add its slug to the `covers` map in [`packages/ui/src/art/blog-cover.tsx`](../packages/ui/src/art/blog-cover.tsx). See [Design](design.md).

## Publishing

1. Write it and check it with `pnpm dev`.
2. Run `pnpm types:check`, which validates the frontmatter.
3. Push to `main`.

Reading time comes from a remark plugin at build time. Every post gets reactions, a read count, comments, an OG card, and entries in `/blogs`, `/feed.xml`, `/sitemap.xml`, and `/llms.txt`.

Renaming a post changes its URL and orphans its reactions and comments, which are keyed by slug. Add a redirect to `redirects()` in `apps/web/next.config.mjs` when you do.
