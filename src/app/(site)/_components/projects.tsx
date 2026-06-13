import { Section, CardGrid, CardGridItem } from "@/components/layouts/page";
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
import { getPublicProjects } from "@/lib/projects";

export async function ProjectGrid() {
  const projects = await getPublicProjects();

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
          className="group transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md"
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
                      >
                        <GithubLogoIcon className="size-4" aria-hidden="true" />
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
      <ProjectGrid />
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
            <GithubLogoIcon className="size-5 mr-2" aria-hidden="true" />

            <span>Explore the Chaos</span>
            <ArrowUpRightIcon
              className="size-4 ml-2 opacity-70"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </Reveal>
    </Section>
  );
}
