import { Section } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/og";
import type { Metadata } from "next";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyLead,
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
        <TypographyH1>Introduction</TypographyH1>
        <TypographyLead>
          I design and build high-performance web experiences with a focus on
          clarity, motion, and precision. My work blends engineering and design
          to create interfaces that feel effortless.
        </TypographyLead>
      </Section>

      {/* ABOUT */}
      <Section>
        <TypographyH2>About</TypographyH2>
        <div className="space-y-8">
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
          <div>
            <TypographyH3>Senior Frontend Engineer</TypographyH3>
            <TypographyP>
              Led development of high-traffic web applications, optimized
              rendering performance, and built reusable design systems used
              across multiple products.
            </TypographyP>
          </div>
          <div>
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
        <div className="space-y-8">
          <div>
            <TypographyH3>Interactive Documentation Platform</TypographyH3>
            <TypographyP>
              Built a dynamic documentation system with auto-generated
              navigation, smooth scroll tracking, and contextual highlighting.
            </TypographyP>
          </div>
          <div>
            <TypographyH3>Motion Design Portfolio</TypographyH3>
            <TypographyP>
              Developed a highly animated portfolio using SVG path tracking and
              scroll-based progress interactions.
            </TypographyP>
          </div>
          <div>
            <TypographyH3>SaaS Dashboard UI</TypographyH3>
            <TypographyP>
              Created modular dashboard components with complex data
              visualization and interaction patterns.
            </TypographyP>
          </div>
        </div>
      </Section>

      {/* CONTACT */}
      <Section>
        <TypographyH2>Contact</TypographyH2>
        <div>
          <TypographyH3>Let's Work Together</TypographyH3>
          <TypographyP>
            If you're building something ambitious and need a frontend engineer
            who cares about detail, motion, and performance — let's talk.
          </TypographyP>
        </div>
      </Section>
    </>
  );
}
