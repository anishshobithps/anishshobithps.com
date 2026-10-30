import type { Metadata } from "next";
import NextImage from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { CopyMarkdown } from "@/app/svg/preview/_components/copy-markdown";
import { PreviewTabs, Segmented } from "@/app/svg/preview/_components/controls";
import {
  type Block,
  cardUrl,
  LINK,
  README,
  toMarkdown,
} from "@/app/svg/preview/readme/readme";
import {
  TypographyH1,
  TypographyH2,
  TypographyMuted,
} from "@/components/ui/typography";
import { getTemplate } from "@/lib/svg/registry";
import { renderTemplate } from "@/lib/svg/render";
import type { Query, Theme } from "@/lib/svg/template";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "README preview",
  robots: { index: false, follow: false },
};

/** GitHub's profile README column, and a phone, as in the README repo's own preview. */
const WIDTHS = { desktop: 846, phone: 343 } as const;

type Width = keyof typeof WIDTHS;
type DataMode = "live" | "fixtures";

interface Settings {
  theme: Theme;
  width: Width;
  data: DataMode;
}

interface Source {
  src: string;
  width: number;
  height: number;
}

function hrefWith(settings: Settings, change: Partial<Settings>) {
  return `/svg/preview/readme?${new URLSearchParams({ ...settings, ...change })}`;
}

/**
 * Live mode points each card at /svg, so it shows the data GitHub would get.
 * Fixtures mode renders each template's first fixture, for when a card's
 * data isn't reachable from here (no GITHUB_TOKEN, no database).
 */
async function source(type: string, query: Query, settings: Settings): Promise<Source> {
  const template = getTemplate(type);
  if (!template) throw new Error(`README uses unknown card "${type}"`);
  const params = template.params.parse(query);
  const size = template.size(params);

  if (settings.data === "live") {
    return { src: cardUrl("", type, query, settings.theme), ...size };
  }
  const svg = await renderTemplate(
    template,
    params,
    template.fixtures[0]?.data,
    settings.theme,
  );
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, ...size };
}

function sourceFor(block: Block, settings: Settings) {
  if (block.kind === "heading") {
    return source("heading", { n: String(block.n) }, settings);
  }
  if (block.kind === "card") return source(block.type, block.query ?? {}, settings);
  return Promise.resolve(null);
}

const LINK_CLASS = "text-(--gh-link) underline underline-offset-3";

function Inline({ text }: { text: string }) {
  const parts = text.split(LINK);
  const nodes: ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    nodes.push(parts[i]);
    if (parts[i + 1] !== undefined) {
      nodes.push(
        <a key={i} href={parts[i + 2]} className={LINK_CLASS}>
          {parts[i + 1]}
        </a>,
      );
    }
  }
  return <>{nodes}</>;
}

/** Each block spaced and sized the way GitHub's markdown CSS does it. */
function Rendered({ block, image }: { block: Block; image: Source | null }) {
  switch (block.kind) {
    case "heading":
      return (
        <h2 className="mt-6 mb-4 border-b border-(--gh-border) pb-2 text-2xl leading-tight font-semibold">
          {image && (
            <NextImage
              src={image.src}
              alt=""
              width={22}
              height={22}
              unoptimized
              className="inline"
            />
          )}{" "}
          {block.title}
        </h2>
      );
    case "paragraph":
      return (
        <p className="mb-4">
          <Inline text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul className="mb-4 list-disc pl-8">
          {block.items.map((item) => (
            <li key={item} className="[&+li]:mt-1">
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case "card":
      return image ? (
        <a href={block.href} className="mb-4 block">
          <NextImage
            src={image.src}
            alt={block.alt}
            width={image.width}
            height={image.height}
            unoptimized
            className="block h-auto w-full"
          />
        </a>
      ) : null;
  }
}

export default async function ReadmePreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const query = await searchParams;
  const settings: Settings = {
    theme: query.theme === "dark" ? "dark" : "light",
    width: query.width === "phone" ? "phone" : "desktop",
    data: query.data === "fixtures" ? "fixtures" : "live",
  };
  const images = await Promise.all(README.map((block) => sourceFor(block, settings)));
  const markdown = toMarkdown(README);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 p-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <TypographyH1>SVG cards</TypographyH1>
          <TypographyMuted>
            A profile README built from every card, laid out the way GitHub renders
            it. Only available in development.
          </TypographyMuted>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <PreviewTabs active="readme" />
          <Segmented
            label="Theme"
            options={(["light", "dark"] as const).map((theme) => ({
              label: theme === "light" ? "Light" : "Dark",
              href: hrefWith(settings, { theme }),
              active: settings.theme === theme,
            }))}
          />
          <Segmented
            label="Width"
            options={(["desktop", "phone"] as const).map((width) => ({
              label: `${width === "desktop" ? "Desktop" : "Phone"} · ${WIDTHS[width]}px`,
              href: hrefWith(settings, { width }),
              active: settings.width === width,
            }))}
          />
          <Segmented
            label="Data"
            options={(["live", "fixtures"] as const).map((data) => ({
              label: data === "live" ? "Live" : "Fixtures",
              href: hrefWith(settings, { data }),
              active: settings.data === data,
            }))}
          />
        </div>
      </header>

      <div className="overflow-x-auto">
        {/* GitHub's palette comes from [data-github-theme] in global.css. */}
        <article
          data-github-theme={settings.theme}
          style={{ "--gh-width": `${WIDTHS[settings.width]}px` } as CSSProperties}
          className="box-content w-(--gh-width) rounded-md border border-(--gh-border) bg-(--gh-canvas) p-6 font-(family-name:--gh-font) text-base leading-normal wrap-break-word text-(--gh-fg) [&>:last-child]:mb-0"
        >
          <div className="-mx-6 -mt-6 mb-6 border-b border-(--gh-border) px-4 py-2 text-sm font-semibold">
            anishshobithps <span className="font-normal text-(--gh-muted)">/ README.md</span>
          </div>
          {README.map((block, index) => (
            <Rendered key={index} block={block} image={images[index]} />
          ))}
        </article>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <TypographyH2>Markdown</TypographyH2>
          <CopyMarkdown markdown={markdown} />
        </div>
        <TypographyMuted>
          The same README with absolute card URLs and a cache-busting v, ready to
          paste. Each card sits in a picture element, so GitHub picks the light or
          dark render to match the viewer.
        </TypographyMuted>
        <pre className="overflow-x-auto rounded-md border bg-muted p-4 text-xs leading-relaxed">
          <code>{markdown}</code>
        </pre>
      </section>
    </main>
  );
}
