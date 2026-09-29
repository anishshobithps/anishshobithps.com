# LICENSE

Version 2.0

Effective Date: 29 September 2026

Copyright (c) 2022–2026 Anish Shobith P S

This repository contains separately licensed code, creative works, and other material. The license that applies depends on the material and its path, as set out below. Do not assume the whole repository is MIT. Rights not expressly granted are reserved.

In short: the functional code is MIT, while the writing and artwork are CC BY-NC-ND 4.0. My name, likeness, and brand identity are not licensed for reuse. Part III explains how brand assets can be licensed as artwork while the brand itself stays reserved.

The summaries in this file explain how the licenses apply here. They do not replace the license texts. Where a summary and a license text differ, the license text governs.

---

# PART I — MIT License (Functional Code)

Everything in this repository is licensed under the MIT License, except:

- the expressive content and paths identified in Part II;
- MDX or Markdown files whose frontmatter contains `license: CC-BY-NC-ND-4.0`, apart from the functional code they contain;
- the material excluded in Part III and Part IV.

That covers, for example:

- Application logic, routes, server actions, and API handlers
- Framework integration code, configuration, and build scripts
- Database schema and committed migrations
- Tests, utilities, hooks, and the functional code of UI components
- The isometric drawing engine in `src/components/diagrams/iso.tsx`, `src/components/diagrams/iso-stage.tsx`, and `src/components/diagrams/classes.ts`
- The OpenGraph image route in `src/app/og/route.tsx`
- Code examples, commands, configuration snippets, and other functional code inside `README.md`, blog posts, and other documentation

## MIT License

MIT License

Copyright (c) 2022–2026 Anish Shobith P S

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

For clarity, the "Software" above means only the material covered by Part I. The MIT License text itself is not subject to the Creative Commons license below.

---

# PART II — Creative Commons License (Writing, Artwork & Brand Assets)

The following material is licensed under:

Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International (CC BY-NC-ND 4.0)

Full legal code:
https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode

## Functional code vs expressive content

The line between Part I and Part II runs through content, not only through files:

- **Functional source code** is MIT under Part I. That includes program logic, data structures, types, component behaviour, markup structure, rendering logic, styling implementation (CSS, Tailwind classes, and design tokens as code), and utility code.
- **Creative expression** implemented through that code is CC BY-NC-ND 4.0 under Part II, wherever it appears. That includes original illustrations and decorative artwork (the drawn shapes, their coordinates, and their composition), distinctive visual compositions, prose, explanations, jokes, slogans, and other creative copy.

For example, in a component that renders an illustration, the JSX that wraps and positions it is MIT, and the illustration's geometry is CC BY-NC-ND. In a blog post, a code block is MIT, and the prose around it is CC BY-NC-ND.

## Where the covered material lives

| Path                                                                                     | What it is                                                                                    |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `content/**`                                                                             | Blog posts, including their images and diagrams                                               |
| `.github/banner-dark.svg`, `banner-light.svg`, `license-dark.svg`, `license-light.svg`   | README artwork                                                                                |
| `public/favicon-dark.svg`, `public/favicon-light.svg`                                    | Logo favicons                                                                                 |
| `src/components/shared/logo.tsx`, `logo-icon.tsx`, `logo-mascot.tsx`                     | The logo, wordmark, and mascot                                                                |
| `src/components/shared/doodles.tsx`                                                      | Hand-drawn doodles and the reaction mascot                                                    |
| `src/components/shared/OG.tsx`                                                           | The OpenGraph card design                                                                     |
| `src/components/diagrams/page-art.tsx`, `blog-covers.tsx`, `git-chaos.tsx`, `layers.tsx` | Isometric page scenes and blog covers                                                         |
| `README.md`                                                                              | Narrative documentation and creative copy; functional code within it remains MIT under Part I |

Image files in this table are covered in full. In source and documentation files, the split above decides which parts are covered. Site copy in other source files is covered by the same split wherever it appears.

## Summary of CC BY-NC-ND 4.0

This summary is explanatory. The legal code linked above is the license.

You may share the covered material in any medium or format, provided that:

- the use is non-commercial;
- you give appropriate attribution (see below); and
- you do not distribute adapted material.

You may NOT:

- use the covered material for commercial purposes;
- distribute adapted, remixed, transformed, or altered versions of it;
- present it as your own work.

The license governs the covered material itself. It does not restrict independent creation of new works inspired by ideas, techniques, or general concepts, including drawing your own isometric scenes with the MIT-licensed engine.

## Attribution

Where reasonably practicable, attribution should:

- name Anish Shobith P S;
- link to https://anishshobithps.com, or to the specific page the material comes from;
- state that the material is licensed under CC BY-NC-ND 4.0, with a link to the license.

For example:

> Illustration by Anish Shobith P S (https://anishshobithps.com), licensed under CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/).

---

# PART III — Name, Likeness & Brand

No license in this repository grants trademark, trade-name, publicity, personality, or similar rights. Creative Commons 4.0 licenses exclude them explicitly.

Some of the assets below also appear in Part II. That licenses them only as copyrighted works, for non-commercial sharing in unmodified form. It grants none of the rights described in this Part.

You may not use the following to identify your own website, fork, product, or service, or to suggest endorsement:

- The name "Anish Shobith P S" and the domain `anishshobithps.com`
- The logo, wordmark, and mascot
- The photograph in `public/profile.avif`, which is not licensed for any reuse

You may use the name and domain solely to identify or accurately describe the original work, including attribution and statements such as "forked from anishshobithps.com". Such reference does not grant permission to use the name, domain, logo, wordmark, or mascot as branding for a derivative project.

---

# PART IV — Third-Party Material

Third-party material keeps its own license and is not relicensed here. That includes:

- Dependencies installed from npm, under their respective licenses
- UI primitives in `src/components/ui/` adapted from shadcn/ui, which is MIT-licensed
- Fonts obtained through `next/font` from Google Fonts (Bricolage Grotesque, Manrope, Fira Code, Geist Pixel), which remain subject to their respective font licenses, including the SIL Open Font License 1.1 where applicable
- `public/fonts/LastoriaBoldRegular.otf`, which remains under its designer's license
- Logos of third-party platforms (GitHub, LinkedIn, X, and others), which are trademarks of their owners

---

# Forking

Fork the machinery, not the words.

- A fork may keep, modify, and redistribute the MIT-licensed code under Part I.
- A fork that still contains Part II material unchanged may redistribute that material under CC BY-NC-ND 4.0, subject to its terms: non-commercially, with attribution, and without modification. The MIT-licensed portions of the fork remain governed by Part I.
- A fork may not redistribute modified versions of the Part II material, and may not use anything in Part III as its own branding.

In practice, remove or replace everything in Part II and Part III before you publish a site built from a fork. The README's "Forking" section has a checklist.

---

# Governing Law and Jurisdiction

This license and any disputes arising from it shall be governed by and interpreted in accordance with the laws of India.

Any disputes shall be subject to the exclusive jurisdiction of the competent courts at Mangaluru, Dakshina Kannada, Karnataka, India.

---

# Permission Requests

For commercial use, redistribution beyond the scope of the licenses above, or any other permission inquiries, contact:

anish.shobith19@gmail.com

---

# Reservation of Rights

All rights not expressly granted under the applicable license are reserved by the copyright holder.

---

# Version History

- **2.0** (29 September 2026): scope set by path and by functional code vs expressive content; code in documentation and posts is MIT; full MIT warranty disclaimer; attribution format; Name, Likeness & Brand section; explicit fork rules; itemised third-party list; a single court seat at Mangaluru.
- **1.1** (23 February 2026): previous version.
