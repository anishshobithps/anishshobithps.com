import { Section, CardGrid, CardGridItem } from "@/components/layouts/page";
import { ProjectsSkeleton } from "@/app/(site)/projects/projects-skeleton";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  TypographyH2,
  TypographyLead,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { GithubLogoIcon, ArrowUpRightIcon } from "@/components/shared/icons";
import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import { getPublicProjects } from "@/lib/projects";
import { unstable_rethrow } from "next/navigation";

export async function ProjectGrid() {
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
        // nothing shipped yet. check back soon.
      </TypographyMuted>
    );
  }

  return (
    <CardGrid cols="grid-cols-1 md:grid-cols-2">
      {projects.map((project, index) => (
        <CardGridItem
          key={project.title}
          className="group transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1.5 hover:shadow-md"
        >
          <Reveal delay={index * 90}>
            <article className="space-y-4" aria-label={project.title}>
              <TypographyH2 className="text-xl">
                {project.title}
              </TypographyH2>
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
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  </li>
                ))}
              </ul>
              <nav aria-label={`Links for ${project.title}`} className="pt-4">
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

                          <span className="ml-2">Live</span>
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
                        <span className="ml-2" aria-hidden="true">
                          GitHub
                        </span>
                      </Link>
                    </Button>
                  )}
                </ButtonGroup>
              </nav>
            </article>
          </Reveal>
        </CardGridItem>
      ))}
    </CardGrid>
  );
}

export function BuiltThings() {
  return (
    <Section aria-label="Things I've Built">
      <Reveal>
        <div className="mb-12 max-w-3xl">
          <TypographyLead>
            A mix of{" "}
            <TypographyMark>
              real systems, useful tools, and controlled chaos
            </TypographyMark>
            .
          </TypographyLead>
        </div>
      </Reveal>
      <Suspense fallback={<ProjectsSkeleton count={4} />}>
        <ProjectGrid />
      </Suspense>
      <Reveal className="mt-16 flex flex-col items-center gap-6 text-center">
        <TypographyLead className="max-w-2xl">
          There's more{" "}
          <TypographyMark>
            experiments, half-built tools, and questionable decisions
          </TypographyMark>{" "}
          living on my GitHub.
        </TypographyLead>
        <Button asChild size="lg" className="rounded-lg font-semibold">
          <Link
            href="https://github.com/anishshobithps"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Explore the Chaos — view all projects on GitHub"
          >
            <GithubLogoIcon
              data-icon="inline-start"
              className="size-5 mr-2"
              aria-hidden="true"
            />

            <span>Explore the Chaos</span>
            <ArrowUpRightIcon
              data-icon="inline-end"
              className="size-4 ml-2 opacity-70"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}
