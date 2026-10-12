import type { Metadata } from "next";
import NextImage from "next/image";
import { notFound } from "next/navigation";
import { PreviewTabs } from "@/app/svg/preview/_components/controls";
import {
  SectionLabel,
  TypographyH1,
  TypographyH2,
  TypographyMuted,
} from "@/components/ui/typography";
import { templates } from "@/lib/svg/registry";
import { renderError, renderTemplate } from "@/lib/svg/render";
import type { AnySvgTemplate, Query, Theme } from "@/lib/svg/template";
import { ERROR_SIZE, type SvgErrorKind } from "@/lib/svg/templates/error";
import { themeColor } from "@/lib/theme-tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SVG cards",
  robots: { index: false, follow: false },
};

const THEMES: Theme[] = ["light", "dark"];

const ERROR_SAMPLES: { kind: SvgErrorKind; message: string }[] = [
  { kind: "unknown-type", message: 'No card called "nope".' },
  { kind: "bad-params", message: "n: Too big: expected number to be <=99" },
  {
    kind: "data-unavailable",
    message: "Couldn't load data for calendar. Try again later.",
  },
];

interface Render {
  theme: Theme;
  src: string;
  width: number;
  height: number;
  bytes: number;
}

function toRender(svg: string, theme: Theme, size: { width: number; height: number }): Render {
  return {
    theme,
    src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    bytes: Buffer.byteLength(svg),
    ...size,
  };
}

function liveUrl(type: string, query: Query, theme: Theme) {
  return `/svg?${new URLSearchParams({ type, theme, ...query })}`;
}

async function renderFixtures(type: string, template: AnySvgTemplate) {
  return Promise.all(
    template.fixtures.map(async (fixture) => {
      const params = template.params.parse(fixture.query);
      const renders = await Promise.all(
        THEMES.map(async (theme) =>
          toRender(
            await renderTemplate(template, params, fixture.data, theme),
            theme,
            template.size(params),
          ),
        ),
      );
      return { label: fixture.label, query: fixture.query, type, renders };
    }),
  );
}

function Panel({ render, href }: { render: Render; href?: string }) {
  return (
    <figure className="flex flex-col gap-2">
      <div
        className="overflow-x-auto rounded-md border p-4"
        style={{ backgroundColor: themeColor("var(--background)", render.theme) }}
      >
        <NextImage
          src={render.src}
          alt=""
          width={render.width}
          height={render.height}
          unoptimized
          className="h-auto max-w-none"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-4">
        <SectionLabel pixel>{`${render.theme} · ${(render.bytes / 1024).toFixed(1)} KB`}</SectionLabel>
        {href && (
          <a href={href} className="text-xs text-muted-foreground underline underline-offset-4">
            Live
          </a>
        )}
      </figcaption>
    </figure>
  );
}

export default async function SvgPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const sections = await Promise.all(
    Object.entries(templates).map(async ([type, template]) => ({
      type,
      fixtures: await renderFixtures(type, template),
    })),
  );

  const errors = await Promise.all(
    ERROR_SAMPLES.map(async ({ kind, message }) => ({
      kind,
      renders: await Promise.all(
        THEMES.map(async (theme) =>
          toRender(await renderError(kind, message, theme), theme, ERROR_SIZE),
        ),
      ),
    })),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 p-8">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <TypographyH1>SVG cards</TypographyH1>
          <TypographyMuted>
            Every template in both themes, rendered from fixtures through the same
            renderer as /svg. Only available in development.
          </TypographyMuted>
        </div>
        <PreviewTabs active="cards" />
      </header>

      {sections.map(({ type, fixtures }) => (
        <section key={type} className="flex flex-col gap-8">
          <TypographyH2>{`type=${type}`}</TypographyH2>
          {fixtures.map((fixture) => (
            <div key={fixture.label} className="flex flex-col gap-4">
              <SectionLabel>{fixture.label}</SectionLabel>
              <div className="grid gap-6">
                {fixture.renders.map((render) => (
                  <Panel
                    key={render.theme}
                    render={render}
                    href={liveUrl(type, fixture.query, render.theme)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <section className="flex flex-col gap-8">
        <TypographyH2>Errors</TypographyH2>
        {errors.map(({ kind, renders }) => (
          <div key={kind} className="flex flex-col gap-4">
            <SectionLabel>{kind}</SectionLabel>
            <div className="grid gap-6">
              {renders.map((render) => (
                <Panel key={render.theme} render={render} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
