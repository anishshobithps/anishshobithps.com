---
license: CC-BY-NC-ND-4.0
---

# The art

None of the illustrations are image exports. They're all drawn in code, so they follow the theme, scale cleanly, and animate without video.

## Where things live

| Piece | Where |
| --- | --- |
| Isometric scene engine | [`src/lib/iso/`](../src/lib/iso/): `figure.ts` (the scene model and its markup), `iso-kit.ts` (projection, solids, shading), `lathe.ts` (turned parts), `tube.ts` (tubes), `parts.ts` (recipes every scene reuses) |
| Scenes | [`src/lib/iso/scenes/`](../src/lib/iso/scenes/), one file per figure |
| Rendering a scene | [`iso-art.tsx`](../src/components/diagrams/iso-art.tsx) draws it as inline SVG, and [`iso-stage.tsx`](../src/components/diagrams/iso-stage.tsx) runs its motion while it's on screen |
| Page figures | [`page-art.tsx`](../src/components/diagrams/page-art.tsx) maps a page name to a scene |
| Blog covers | [`blog-covers.tsx`](../src/components/diagrams/blog-covers.tsx) maps a post slug to a scene |
| Projection helpers | [`iso.tsx`](../src/components/diagrams/iso.tsx), still used by the OG images, the post grid filler, and the git chart ([`git-chaos.tsx`](../src/components/diagrams/git-chaos.tsx)) |
| Shared animation classes | [`classes.ts`](../src/components/diagrams/classes.ts) |
| Doodles and nudges | [`src/components/shared/doodles.tsx`](../src/components/shared/doodles.tsx) |
| Logo and mascot | `logo.tsx`, `logo-icon.tsx`, `logo-mascot.tsx` in `src/components/shared/` |
| OpenGraph card | [`src/components/shared/OG.tsx`](../src/components/shared/OG.tsx), rendered by `/og` |

The `/branding` page shows the type scale, logos, doodles, and a live OG preview in one place.

## How a scene works

A scene is one drawn object: static SVG markup plus the CSS keyframes that move it. The engine in `src/lib/iso/` touches neither React nor the DOM. It builds the markup as a string, and motion comes from a model sampled at build time, so every part that moves and every number in a readout share one timeline.

On the site, `PageArt` and `BlogCover` build each scene once on the server and cache it. `IsoArt` writes the markup into an SVG, and `IsoStage` watches the element and turns on the loop while it's visible. Hovering or focusing a card plays it too. Both the site and the README build import the same engine.

Motion respects `prefers-reduced-motion`.

### Adding a page figure

1. Add a file in `src/lib/iso/scenes/` that exports a function returning a `Scene`.
2. Add it to the `scenes` object in `page-art.tsx`.
3. Render it with `<PageArt name="yourScene" />`.

Pages sized 16:9 (the home page bands) and 4:3 (page heroes, contact, the 404) get scenes framed for that shape.

### Adding a blog cover

Add the post's slug to the `covers` object in `blog-covers.tsx`. A post without an entry gets the typewriter scene until it has its own. See [Writing posts](writing-posts.md).

## Colour

Colours come from the tokens in [`src/app/global.css`](../src/app/global.css). The OG route and the `/svg` cards run on the server, where CSS variables don't exist, so [`src/lib/theme-tokens.ts`](../src/lib/theme-tokens.ts) reads that file and resolves `var()` and `color-mix()` into hex. The README artwork in `.github/` is built the same way, with its text converted to outlines so it renders identically on GitHub in both themes.

## Licensing

The engine is MIT. The expressive artwork produced with it, meaning the scenes, doodles, mascot, and card design, is CC BY-NC-ND 4.0. [`LICENSE.md`](../LICENSE.md) lists the exact paths. See [Forking](forking.md) for what that means for a fork.
