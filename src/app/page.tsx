import { Section } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyLead,
  TypographyMuted,
  TypographyP,
} from "@/components/ui/typography";

export const metadata: Metadata = buildMeta({
  title: siteConfig.name,
  description: siteConfig.description,
  path: "home",
});

export default function Page() {
  return (
    <>
      {/* HERO */}
      <Section variant="hero">
        <div className="flex flex-col gap-3">
          {siteConfig.availableForHire && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Available for hire
            </span>
          )}
          <TypographyMuted className="font-mono text-xs uppercase tracking-widest">
            {siteConfig.role}
          </TypographyMuted>
          <TypographyH1>{siteConfig.name}</TypographyH1>
        </div>
        <TypographyLead className="max-w-xl">
          {siteConfig.description}
        </TypographyLead>
      </Section>

      {/* ABOUT */}
      <Section>
        <TypographyH2>About</TypographyH2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <TypographyH3>Background</TypographyH3>
            <TypographyP>
              With a strong foundation in frontend engineering, I specialize in
              React, animation systems, and modern web architecture. I enjoy
              crafting systems that are scalable, maintainable, and elegant.
            </TypographyP>
          </div>
          <div>
            <TypographyH3>Philosophy</TypographyH3>
            <TypographyP>
              Simplicity scales. Every interface should communicate hierarchy,
              motion, and structure clearly. I focus on building experiences
              that feel intuitive and natural.
            </TypographyP>
          </div>
        </div>
      </Section>

      {/* EXPERIENCE */}
      <Section>
        <TypographyH2>Experience</TypographyH2>
        <div className="space-y-8">
          <div className="border-l-2 border-border pl-5">
            <TypographyH3>Senior Frontend Engineer</TypographyH3>
            <TypographyP>
              Led development of high-traffic web applications, optimized
              rendering performance, and built reusable design systems used
              across multiple products.
            </TypographyP>
          </div>
          <div className="border-l-2 border-border pl-5">
            <TypographyH3>UI Systems Architect</TypographyH3>
            <TypographyP>
              Designed motion systems, scroll interactions, and component
              libraries that improved consistency and reduced engineering
              overhead.
            </TypographyP>
          </div>
        </div>
      </Section>

      {/* PROJECTS */}
      <Section>
        <TypographyH2>Projects</TypographyH2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="rounded-lg border bg-muted/30 p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
            <TypographyH3>Interactive Documentation Platform</TypographyH3>
            <TypographyMuted className="leading-relaxed">
              Built a dynamic documentation system with auto-generated
              navigation, smooth scroll tracking, and contextual highlighting.
            </TypographyMuted>
          </div>
          <div className="rounded-lg border bg-muted/30 p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
            <TypographyH3>Motion Design Portfolio</TypographyH3>
            <TypographyMuted className="leading-relaxed">
              Developed a highly animated portfolio using SVG path tracking and
              scroll-based progress interactions.
            </TypographyMuted>
          </div>
          <div className="rounded-lg border bg-muted/30 p-5 flex flex-col gap-3 hover:bg-muted/50 transition-colors">
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
              <Button key={item.label} asChild variant="outline" size="sm">
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
