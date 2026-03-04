"use client";

import {
  IconBrandNextjs,
  IconBrandReact,
  IconBrandTypescript,
  IconBrandTailwind,
  IconBrandVercel,
  IconBrandGithub,
  IconBrandFramerMotion,
  IconDatabase,
} from "@tabler/icons-react";

import { Section } from "@/components/layouts/page";
import {
  TypographyH3,
  TypographyLead,
  TypographyMark,
  SectionLabel,
} from "@/components/ui/typography";
import { DecorIcon } from "@/components/ui/border";

export function Ecosystem() {
  return (
    <Section aria-label="Ecosystem">
      <h2 className="sr-only">Ecosystem</h2>
      <div className="flex items-center gap-3 mb-10" aria-hidden="true">
        <SectionLabel>Ecosystem</SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="mb-12 max-w-3xl">
        <TypographyLead>
          I mostly operate inside the{" "}
          <TypographyMark>
            TypeScript + modern frontend ecosystem
          </TypographyMark>{" "}
          — but I experiment freely and pick tools based on the problem (and
          occasionally regret it halfway through).
        </TypographyLead>
      </div>

      <ul
        role="list"
        aria-label="Tools and technologies"
        className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {tools.map((item) => (
          <li
            key={item.label}
            className="group relative p-4 border lg:p-6 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:-translate-y-0.5 will-change-transform"
          >
            <DecorIcon position="top-left" aria-hidden="true" />
            <DecorIcon position="top-right" aria-hidden="true" />
            <DecorIcon position="bottom-left" aria-hidden="true" />
            <DecorIcon position="bottom-right" aria-hidden="true" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              <item.icon
                className="size-8 text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
                stroke={1.5}
                aria-hidden="true"
              />
              <TypographyH3 className="text-sm font-medium">
                {item.label}
              </TypographyH3>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 max-w-2xl">
        <TypographyLead className="text-sm">
          I'm not loyal to tools — only to good outcomes. If something feels
          repetitive or inefficient, I'll experiment until it doesn't.
        </TypographyLead>
      </div>
    </Section>
  );
}

const tools = [
  { label: "TypeScript", icon: IconBrandTypescript },
  { label: "React", icon: IconBrandReact },
  { label: "Next.js", icon: IconBrandNextjs },
  { label: "Tailwind CSS", icon: IconBrandTailwind },
  { label: "Framer Motion", icon: IconBrandFramerMotion },
  { label: "PostgreSQL", icon: IconDatabase },
  { label: "GitHub", icon: IconBrandGithub },
  { label: "Vercel", icon: IconBrandVercel },
];
