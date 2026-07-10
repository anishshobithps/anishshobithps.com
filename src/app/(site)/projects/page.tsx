import { ProjectGrid } from "@/app/(site)/_components/projects";
import { ProjectsSkeleton } from "@/app/(site)/projects/projects-skeleton";
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
import { Suspense } from "react";

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
          Everything I actually shipped — and{" "}
          <TypographyMark>a few things I started at midnight</TypographyMark>{" "}
          and never quite finished.
        </TypographyLead>
      </Section>
      <Section aria-label="Projects list">
        <Suspense fallback={<ProjectsSkeleton count={6} />}>
          <ProjectGrid />
        </Suspense>
      </Section>
    </>
  );
}
