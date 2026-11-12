import { PageArt } from "@repo/diagrams/page-art";
import { HeroWithArt } from "@/components/layouts/hero-art";
import { ProjectGrid } from "@/app/(site)/_components/projects";
import { ProjectsSkeleton } from "@/app/(site)/projects/projects-skeleton";
import { Section } from "@/components/layouts/page";
import { JsonLd } from "@/components/shared/json-ld";
import {
  TypographyH1,
  TypographyLead,
  TypographyMark,
} from "@repo/ui/components/typography";
import { siteConfig } from "@repo/site-config";
import { buildMeta } from "@/lib/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicProjects } from "@/lib/projects";
import { unstable_rethrow } from "next/navigation";

export const metadata: Metadata = buildMeta({
  title: "Projects",
  pageTitle: "Projects",
  description:
    "A mix of real systems, useful tools, and controlled chaos. From event websites to Discord bots to the experiments living on my GitHub.",
  path: "home / projects",
  canonicalPath: "/projects",
  type: "website",
});

async function ProjectsArt() {
  let titles: string[] = [];
  try {
    titles = (await getPublicProjects()).map((project) => project.title);
  } catch (error) {
    unstable_rethrow(error);
  }
  return <PageArt name="projects" data={titles} />;
}

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
        <HeroWithArt
          art={
            <Suspense fallback={<PageArt name="projects" />}>
              <ProjectsArt />
            </Suspense>
          }
        >
          <TypographyH1>Projects</TypographyH1>
          <TypographyLead>
            Everything I actually shipped, plus{" "}
            <TypographyMark>a few things I started at midnight</TypographyMark>{" "}
            and never quite finished.
          </TypographyLead>
        </HeroWithArt>
      </Section>
      <Section variant="flush" aria-label="Projects list">
        <Suspense fallback={<ProjectsSkeleton count={6} />}>
          <ProjectGrid />
        </Suspense>
      </Section>
    </>
  );
}
