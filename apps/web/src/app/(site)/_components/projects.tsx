import { Section, CardGrid, CardGridItem } from "@/components/layouts/page";
import { ProjectsSkeleton } from "@/app/(site)/projects/projects-skeleton";
import { Reveal } from "@/components/shared/reveal";
import { GitChaos } from "@repo/diagrams/git-chaos";
import { IsoStage } from "@repo/diagrams/iso-stage";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@repo/ui/components/button-group";
import {
  Heading,
  TypographyH2,
  TypographyLead,
  TypographyMuted,
  SectionLabel,
} from "@repo/ui/components/typography";
import {
  GithubLogoIcon,
  ArrowUpRightIcon,
  ArrowRightIcon,
} from "@repo/icons";
import Link from "next/link";
import { padIndex } from "@repo/core/text";
import type { Route } from "next";
import { Suspense } from "react";
import { getPublicProjects } from "@/lib/projects";
import { unstable_rethrow } from "next/navigation";

export async function ProjectGrid({
  headingLevel = "h2",
  limit,
}: {
  headingLevel?: "h2" | "h3";
  limit?: number;
}) {
  let projects: Awaited<ReturnType<typeof getPublicProjects>>;
  try {
    projects = await getPublicProjects();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Failed to load public projects:", error);
    projects = [];
  }

  if (projects.length === 0) {
    return (
      <TypographyMuted className="py-12 text-center font-mono text-sm">
        {"// nothing shipped yet. check back soon."}
      </TypographyMuted>
    );
  }

  const shown = limit ? projects.slice(0, limit) : projects;
  const hidden = projects.length - shown.length;

  return (
    <CardGrid>
      {shown.map((project, index) => (
        <CardGridItem key={project.title}>
          <SectionLabel pixel className="absolute top-4 right-4 @sm:top-6 @sm:right-6">
            No.{padIndex(index + 1)}
          </SectionLabel>
          <Reveal delay={index * 90}>
            <article className="space-y-4" aria-label={project.title}>
              <Heading as={headingLevel} level="h4" className="pr-14">
                {project.title}
              </Heading>
              <TypographyMuted className="leading-relaxed">
                {project.description}
              </TypographyMuted>
              <ul
                role="list"
                aria-label="Technologies used"
                className="flex flex-wrap gap-2 pt-2"
              >
                {project.highlights.map((tag) => (
                  <li key={tag}>
                    <Badge variant="outline">
                      {tag}
                    </Badge>
                  </li>
                ))}
              </ul>
              <div
                role="group"
                aria-label={`Links for ${project.title}`}
                className="pt-4"
              >
                <ButtonGroup>
                  {project.live && (
                    <>
                      <Button asChild size="sm" variant="default">
                        <Link
                          href={project.live as Route}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.title} live site`}
                        >
                          <ArrowUpRightIcon
                            data-icon="inline-start"
                            className="size-4"
                            aria-hidden="true"
                          />

                          <span>Live</span>
                        </Link>
                      </Button>
                      <ButtonGroupSeparator />
                    </>
                  )}
                  {project.github && (
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={project.github as Route}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} on GitHub`}
                      >
                        <GithubLogoIcon
                          data-icon="inline-start"
                          className="size-4"
                          aria-hidden="true"
                        />
                        <span aria-hidden="true">
                          GitHub
                        </span>
                      </Link>
                    </Button>
                  )}
                </ButtonGroup>
              </div>
            </article>
          </Reveal>
        </CardGridItem>
      ))}
      {hidden > 0 && (
        <CardGridItem className="p-0 @sm:p-0 @lg:p-0 md:col-span-2">
          <Link
            href="/projects"
            prefetch={false}
            data-sound="tap"
            className="group/more flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover @sm:p-6 @lg:p-8"
          >
            <span className="flex min-w-0 flex-col gap-1">
              <SectionLabel pixel>
                No.{padIndex(shown.length + 1)} to No.{padIndex(projects.length)}
              </SectionLabel>
              <Heading as="p" level="h4">
                {hidden === 1 ? "1 more project" : `${hidden} more projects`}
              </Heading>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <TypographyMuted asChild>
                <span className="max-sm:sr-only">See all {projects.length}</span>
              </TypographyMuted>
              <ArrowRightIcon
                aria-hidden="true"
                className="size-5 transition-transform duration-300 ease-snappy group-hover/more:translate-x-1"
              />
            </span>
          </Link>
        </CardGridItem>
      )}
    </CardGrid>
  );
}

export function BuiltThings() {
  return (
    <Section aria-label="Things I've built" doodle="bot">
      <Reveal>
        <div className="flex max-w-3xl flex-col gap-3">
          <TypographyH2>Things I&apos;ve built</TypographyH2>
          <TypographyLead>
            A mix of real systems, useful tools, and controlled chaos.
          </TypographyLead>
        </div>
      </Reveal>
      <Suspense fallback={<ProjectsSkeleton count={2} />}>
        <ProjectGrid headingLevel="h3" limit={2} />
      </Suspense>
      <Reveal className="group/iso mt-16 flex flex-col items-center gap-6 text-center">
        <IsoStage className="w-full max-w-xl">
          <GitChaos />
        </IsoStage>
        <TypographyLead className="max-w-2xl">
          There are more experiments and half-built tools living on my GitHub.
        </TypographyLead>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-lg font-semibold"
        >
          <Link
            href="https://github.com/anishshobithps"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Browse everything on GitHub (opens in new tab)"
          >
            <GithubLogoIcon
              data-icon="inline-start"
              className="size-5"
              aria-hidden="true"
            />

            <span>Browse my GitHub</span>
            <ArrowUpRightIcon
              data-icon="inline-end"
              className="size-4 opacity-70"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}
