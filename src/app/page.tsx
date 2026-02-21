import { Section } from "@/components/layouts/page";
import { experiences, siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import {
  TypographyH2,
  TypographyH3,
  TypographyMuted,
  TypographyP,
} from "@/components/ui/typography";
import { WorkExperience } from "@/components/ui/experience";
import { Hero } from "./_components/hero";

export const metadata: Metadata = buildMeta({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "home",
});

export default function Page() {
  return (
    <>
      {/* HERO */}
      <Hero />

      {/* EXPERIENCE */}
      <Section>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-lg font-mono font-medium tracking-widest text-muted-foreground/60 uppercase">
            Experience
          </span>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <WorkExperience experiences={experiences} />
      </Section>

      {/* PROJECTS */}
      <Section>
        <TypographyH2>Projects</TypographyH2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="border bg-muted/30 p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
            <TypographyH3>Interactive Documentation Platform</TypographyH3>
            <TypographyMuted className="leading-relaxed">
              Built a dynamic documentation system with auto-generated
              navigation, smooth scroll tracking, and contextual highlighting.
            </TypographyMuted>
          </div>
          <div className="border bg-muted/30 p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
            <TypographyH3>Motion Design Portfolio</TypographyH3>
            <TypographyMuted className="leading-relaxed">
              Developed a highly animated portfolio using SVG path tracking and
              scroll-based progress interactions.
            </TypographyMuted>
          </div>
          <div className="border bg-muted/30 p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
            <TypographyH3>SaaS Dashboard UI</TypographyH3>
            <TypographyMuted className="leading-relaxed">
              Created modular dashboard components with complex data
              visualization and interaction patterns.
            </TypographyMuted>
          </div>
        </div>
      </Section>

      {/* CONTACT */}
      <Section>
        <TypographyH2>Contact</TypographyH2>
        <div className="space-y-5">
          <div>
            <TypographyH3>Let&apos;s Work Together</TypographyH3>
            <TypographyP>
              If you&apos;re building something ambitious and need a frontend
              engineer who cares about detail, motion, and performance —
              let&apos;s talk.
            </TypographyP>
          </div>
          <div className="flex flex-wrap gap-2">
            {siteConfig.social.map((item) => (
              <Button
                key={item.label}
                asChild
                variant="outline"
                size="sm"
                className="rounded-none"
              >
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
