"use client";

import { Section } from "@/components/layouts/page";
import { Badge } from "@/components/ui/badge";
import { DecorIcon } from "@/components/ui/border";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  SectionLabel,
  TypographyH3,
  TypographyLead,
  TypographyMark,
  TypographyMuted,
} from "@/components/ui/typography";
import { IconBrandGithubFilled } from "@tabler/icons-react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { projects } from "@/lib/config";

export function BuiltThings() {
  return (
    <Section aria-label="Things I've Built">
      <h2 className="sr-only">Things I&apos;ve Built</h2>
      <div className="flex items-center gap-3 mb-10" aria-hidden="true">
        <SectionLabel>Things I've Built</SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="mb-12 max-w-3xl">
        <TypographyLead>
          A mix of{" "}
          <TypographyMark>
            real systems, useful tools, and controlled chaos
          </TypographyMark>
          .
        </TypographyLead>
      </div>

      <ul
        role="list"
        className="w-full max-w-5xl grid md:grid-cols-2 gap-6 lg:gap-8"
      >
        {projects.map((project) => (
          <li
            key={project.title}
            className="group relative p-0 border-0 lg:p-6 lg:border transition-transform duration-300 hover:-translate-y-0.5 will-change-transform"
          >
            <div className="hidden lg:block" aria-hidden="true">
              <DecorIcon position="top-left" />
              <DecorIcon position="top-right" />
              <DecorIcon position="bottom-left" />
              <DecorIcon position="bottom-right" />
            </div>

            <article
              className="relative z-10 space-y-4"
              aria-label={project.title}
            >
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
                          <ArrowUpRight className="size-4" aria-hidden="true" />
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
                      <IconBrandGithubFilled
                        className="size-4"
                        aria-hidden="true"
                      />
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
          </li>
        ))}
      </ul>

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
            <IconBrandGithubFilled className="size-5 mr-2" aria-hidden="true" />
            <span>Explore the Chaos</span>
            <ArrowUpRight
              className="size-4 ml-2 opacity-70"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </div>
    </Section>
  );
}
