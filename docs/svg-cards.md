---
license: CC-BY-NC-ND-4.0
---

# SVG cards

`/svg` renders cards for my GitHub READMEs from the site's own data, tokens, and fonts. Each response is a static SVG with its text drawn as glyph outlines, so GitHub's image proxy shows exactly what the site renders, with no fonts, scripts, or external requests inside.

## Request

```
GET /svg?type=<template>&theme=light|dark&v=<n>&<template options>
```

| Param | Notes |
| --- | --- |
| `type` | Required. One of the templates below. Anything else returns an error card with status 400. |
| `theme` | Required. `light` or `dark`. The SVG can't follow the viewer's theme, so the README picks one with `<picture>`. |
| `v` | Ignored by the server. Bump it in the README to bust GitHub's image cache after a design change. |

## Templates

| `type` | Shows | Options |
| --- | --- | --- |
| `banner` | The name header: my photo in the old README's notched frame, the name stacked large, the domain, and my role in a turned pill. Transparent, so it sits on GitHub's canvas | `role` (up to 24 characters, defaults to `siteConfig.role`) |
| `heading` | A numbered section heading | `n` (1 to 99), `title` (optional, cut at 40 characters; without it you get a 24 px circle to sit inline in a Markdown heading) |
| `post` | The newest post: title, description, date, reading time and tags | `slug` (defaults to the newest post) |
| `activity` | When I code: a weekday by hour grid in local time | `source=github\|wakatime\|both` (default `github`) |
| `calendar` | The last 12 months of contributions, with current and longest streak, best day and active days | none |
| `posts` | The newest posts with reading time, reads and date | `limit` (1 to 8, default 3) |
| `guestbook` | The latest guestbook signatures with avatars and the total | `limit` (1 to 6, default 3) |
| `local` | Any place right now (Mangalore by default): the time, what the hour is for, the weather, and today's daylight as 24 hour cells | `city` (geocoded) with optional `country` (two letters, e.g. `country=US` for the other Paris), or `lat` and `lon`. `name` relabels the place. `units=c\|f` (default `c`) |
| `resume` | The latest resume build and downloads per release | none |

## Using a card in a README

```html
<a href="https://anishshobithps.com/blogs/latest">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://anishshobithps.com/svg?type=post&theme=dark&v=1">
    <img src="https://anishshobithps.com/svg?type=post&theme=light&v=1" width="100%" alt="Latest post on anishshobithps.com">
  </picture>
</a>
```

`/blogs/latest` redirects to the newest post, so the link lands on the post the card shows.

## How it fits together

- [`src/app/svg/route.tsx`](../src/app/svg/route.tsx) reads `type`, finds the template in [`src/lib/svg/registry.ts`](../src/lib/svg/registry.ts), validates the options with the template's zod schema, loads its data, and renders it with takumi's `renderSvg()`.
- Each template is one file in [`src/lib/svg/templates/`](../src/lib/svg/templates/), built from the primitives in [`primitives.tsx`](../src/lib/svg/primitives.tsx). Colours go through `themeColor()`, the same path as the OG card. Fonts load once per server in [`fonts.ts`](../src/lib/svg/fonts.ts), shared with `/og`.
- Templates never fetch and loaders never render. Loaders live in [`src/lib/svg/data/`](../src/lib/svg/data/) and are cached with `unstable_cache`: half an hour for `local`'s weather, an hour for `post`, `posts` and `guestbook`, six hours for the GitHub-backed cards. Anything that depends on the clock (the time on `local`, "3d ago") is worked out at render, so it stays right between refreshes. The cache key includes the deployment ID, so a new deploy never reads data shaped by older code. With camo's cache switched off, every README view reaches the route, so a warm response is a cache read and a render.
- Every response, errors included, is `image/svg+xml` with `Cache-Control: max-age=0, no-cache, no-store, must-revalidate`, `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox`, and `X-Content-Type-Options: nosniff`. Errors are small SVG cards (400 for bad input, 500 when data or rendering fails), never an HTML page.
- `/svg` is left out of the global header rule in [`next.config.mjs`](../next.config.mjs). Otherwise the site's CSP replaces the card's sandboxed one.

## About the data

- `activity` only searches public repos (`is:public`), so a `GITHUB_TOKEN` that can see private repos never puts their names on a card. Without a token, GitHub's anonymous search limit is enough at this cache length.
- `activity` with `source=github` buckets my last 500 public commits by the local hour written in each commit's timestamp. GitHub's own calendar can't show that view. `wakatime` and `both` need `WAKATIME_API_KEY` and read the last seven days of durations. `both` averages each source's share, so commits and minutes weigh the same.
- `calendar` reads the contribution calendar over GraphQL when `GITHUB_TOKEN` is set and works. Without a token, or if GraphQL rejects it, it parses the public graph at `github.com/users/<me>/contributions`, the same one visitors see on my profile. The two can disagree on a few days: GraphQL counts days in the token owner's time zone, the public page in UTC. An empty today doesn't break the current streak.
- `local` uses [Open-Meteo](https://open-meteo.com/) for geocoding and weather, which needs no key. A city resolves to the most populous match, and the time zone comes from the forecast for those coordinates. A city that doesn't exist is a 400, like any other bad option. Coordinates are rounded to two decimals so nearby requests share a cache entry.
- `resume` reads the releases behind `siteConfig.resumeURL`, so downloads only count the releases still published.
- Guestbook avatars are fetched by the loader and cached as data URIs (capped at 120 KB each), so the SVG never points at another host. Emoji in guestbook messages come from takumi's twemoji provider, also inlined.

## Previewing

`/svg/preview` renders every template's fixtures in both themes through the same renderer, with each card's size and a link to its live version. `/svg/preview/readme` lays the cards out as a profile README the way GitHub renders it, and copies the Markdown. Both only exist in development and return a 404 in production.

## Adding a card

1. Add one file in `src/lib/svg/templates/` that exports `defineTemplate({ params, size, load, revalidate, fixtures, render })`.
2. Add one line in the registry.

Geist Pixel glyphs are heavy as outlines (about 20 KB each), so the pixel face is kept to a card's title label and the heading number, and the rest of the small labels use Fira Code. Cards come out between 40 and 280 KB and gzip to about a tenth of that.

Tests for the route and its loaders are in `tests/svg-route.test.ts` and `tests/svg-data.test.ts`.
