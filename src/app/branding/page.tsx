import { Logo } from "@/components/logo";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyLead,
  TypographyP,
  TypographyMuted,
  TypographyInlineCode,
} from "@/components/ui/typography";

export default function BrandingPage() {
  return (
    <>
      <div className="container mx-auto max-w-5xl px-6 py-16 space-y-20">
        {/* ───────────────── HERO ───────────────── */}
        <section className="space-y-6">
          <div className="flex items-center gap-6">
            <Logo size={72} gapDot />
            <div>
              <TypographyH1>n10nce</TypographyH1>
              <TypographyLead>
                Minimal identity system for a developer portfolio.
              </TypographyLead>
            </div>
          </div>

          <TypographyP className="max-w-2xl">
            A geometric split-crossbar mark designed for clarity, scalability,
            and theme adaptability. Built entirely with SVG and semantic color
            tokens.
          </TypographyP>
        </section>

        {/* ───────────────── LOGO VARIANTS ───────────────── */}
        <section className="space-y-10">
          <TypographyH2>Logo Variants</TypographyH2>

          <div className="grid gap-10 md:grid-cols-3">
            {/* Default */}
            <div className="space-y-4">
              <Logo size={72} />
              <TypographyMuted>Default (Auto Light/Dark)</TypographyMuted>
            </div>

            {/* Accent */}
            <div className="space-y-4">
              <Logo size={72} accentBackground />
              <TypographyMuted>Accent Background</TypographyMuted>
            </div>

            {/* Outline */}
            <div className="space-y-4">
              <Logo size={72} container={false} outline />
              <TypographyMuted>Outline</TypographyMuted>
            </div>

            {/* No Container */}
            <div className="space-y-4">
              <Logo size={72} container={false} className="text-primary" />
              <TypographyMuted>No Container</TypographyMuted>
            </div>
          </div>
        </section>

        {/* ───────────────── COLOR SYSTEM ───────────────── */}
        <section className="space-y-10">
          <TypographyH2>Color System</TypographyH2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorSwatch label="Background" className="bg-background" />
            <ColorSwatch label="Foreground" className="bg-foreground" />
            <ColorSwatch label="Accent" className="bg-accent" />
            <ColorSwatch label="Muted" className="bg-muted" />
          </div>

          <TypographyP>
            All logo variants use semantic tokens like{" "}
            <TypographyInlineCode>fill-foreground</TypographyInlineCode> and{" "}
            <TypographyInlineCode>fill-accent-foreground</TypographyInlineCode>{" "}
            — no hardcoded hex values.
          </TypographyP>
        </section>

        {/* ───────────────── TYPOGRAPHY ───────────────── */}
        <section className="space-y-10">
          <TypographyH2>Typography</TypographyH2>

          <div className="space-y-6">
            <TypographyH3>Headings</TypographyH3>
            <TypographyP>
              Used for structure and hierarchy across the portfolio.
            </TypographyP>

            <TypographyH3>Body</TypographyH3>
            <TypographyP>
              Clean readable system optimized for developer documentation and
              case studies.
            </TypographyP>
          </div>
        </section>

        {/* ───────────────── USAGE ───────────────── */}
        <section className="space-y-6">
          <TypographyH2>Usage</TypographyH2>

          <TypographyP>
            The logo adapts automatically to theme changes and works across:
          </TypographyP>

          <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
            <li>Navbar headers</li>
            <li>Hero sections</li>
            <li>Favicon exports</li>
            <li>Accent call-to-actions</li>
          </ul>
        </section>
      </div>
    </>
  );
}

function ColorSwatch({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="space-y-3">
      <div className={`h-16 w-full rounded-lg border ${className}`} />
      <TypographyMuted>{label}</TypographyMuted>
    </div>
  );
}
