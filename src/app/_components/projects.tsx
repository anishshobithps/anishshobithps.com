"use client";

import { Section, CardGrid, CardGridItem } from "@/components/layouts/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  SectionHeader,
  TypographyH3,
  TypographyLead,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { GithubLogoIcon, ArrowUpRightIcon } from "@/components/shared/icons";

import Link from "next/link";
import { projects } from "@/lib/config";

export function BuiltThings() {
  return (
    <Section aria-label="Things I've Built">
      <SectionHeader>Things I've Built</SectionHeader>
      <div className="mb-12 max-w-3xl">
        <TypographyLead>
          A mix of{" "}
          <TypographyMark>
            real systems, useful tools, and controlled chaos
          </TypographyMark>
          .
        </TypographyLead>
      </div>

      <CardGrid cols="grid-cols-1 md:grid-cols-2">
        {projects.map((project) => (
          <CardGridItem
            key={project.title}
            className="group transition-transform duration-300 hover:-translate-y-0.5 will-change-transform"
          >
            <article className="space-y-4" aria-label={project.title}>
              <TypographyH3 className="text-xl">{project.title}</TypographyH3>
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
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View ${project.title} live site`}
                        >
                          <ArrowUpRightIcon
                            className="size-4"
                            aria-hidden="true"
                          />

                          <span className="ml-2">View</span>
                        </Link>
                      </Button>
                      <ButtonGroupSeparator />
                    </>
                  )}
                  <Button asChild size="sm" variant="secondary">
                    <Link
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GithubLogoIcon className="size-4" aria-hidden="true" />
                      <span className="ml-2" aria-hidden="true">
                        GitHub
                      </span>
                      <span className="sr-only">
                        View {project.title} on GitHub
                      </span>
                    </Link>
                  </Button>
                </ButtonGroup>
              </nav>
            </article>
          </CardGridItem>
        ))}
      </CardGrid>

      <div className="mt-16 flex flex-col items-center gap-6 text-center">
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
      </div>
    </Section>
  );
}
