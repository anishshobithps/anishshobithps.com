import { ProjectGrid } from "@/app/_components/projects";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMeta({
  title: "Projects",
  pageTitle: "Projects",
  description:
    "A mix of real systems, useful tools, and controlled chaos. From event websites to Discord bots to the experiments living on my GitHub.",
  path: "home / projects",
  canonicalPath: "/projects",
  type: "website",
});

export default function ProjectsPage() {
  return (
    <>
      <JsonLd
        type="webpage"
        title="Projects"
        description="A mix of real systems, useful tools, and controlled chaos. From event websites to Discord bots to the experiments living on my GitHub."
        canonicalUrl={`${siteConfig.baseUrl}/projects`}
      />
      <Section variant="hero" aria-label="Projects header">
        <TypographyH1>Projects</TypographyH1>
        <TypographyLead>
          A mix of{" "}
          <TypographyMark>
            real systems, useful tools, and controlled chaos
          </TypographyMark>
          .
        </TypographyLead>
      </Section>
      <Section aria-label="Projects list">
        <ProjectGrid />
      </Section>
    </>
  );
}
