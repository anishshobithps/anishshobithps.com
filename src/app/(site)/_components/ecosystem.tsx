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
import { Section, CardGrid, CardGridItem } from "@/components/layouts/page";
import { Reveal } from "@/components/shared/reveal";
import {
  TypographyH3,
  TypographyLead,
  TypographyMark,
  SectionHeader,
} from "@/components/ui/typography";

export function Ecosystem() {
  return (
    <Section aria-label="Ecosystem">
      <SectionHeader>Ecosystem</SectionHeader>

      <Reveal>
        <div className="mb-12 max-w-3xl">
          <TypographyLead>
            My default stack is TypeScript, React, and Next.js — but I pick
            tools based on the problem and experiment freely.{" "}
            <TypographyMark>
              (And occasionally regret it halfway through.)
            </TypographyMark>
          </TypographyLead>
        </div>
      </Reveal>

      <Reveal>
        <CardGrid cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {tools.map((item) => (
            <CardGridItem
              key={item.label}
              className="group flex flex-col items-center justify-center text-center transition-transform duration-300 hover:-translate-y-0.5"
            >
              <item.icon
                className="size-8 text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
                stroke={1.5}
                aria-hidden="true"
              />
              <TypographyH3 className="text-sm font-medium mt-3">
                {item.label}
              </TypographyH3>
            </CardGridItem>
          ))}
        </CardGrid>
      </Reveal>

      <Reveal>
        <div className="mt-12 max-w-2xl">
          <TypographyLead className="text-sm">
            I&apos;m not loyal to tools — only to good outcomes. If something
            feels repetitive or inefficient, I&apos;ll experiment until it
            doesn&apos;t.
          </TypographyLead>
        </div>
      </Reveal>
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
