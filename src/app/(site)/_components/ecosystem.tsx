import { Section } from "@/components/layouts/page";
import { Reveal } from "@/components/shared/reveal";
import {
  TypographyLead,
  TypographyMark,
  SectionHeader,
} from "@/components/ui/typography";

const tools = [
  "TypeScript",
  "React",
  "Next.js",
  "Tailwind CSS",
  "Framer Motion",
  "PostgreSQL",
  "GitHub",
  "Vercel",
];

export function Ecosystem() {
  return (
    <Section aria-label="Ecosystem">
      <SectionHeader>Ecosystem</SectionHeader>

      <Reveal>
        <div className="max-w-3xl space-y-8">
          <ul
            role="list"
            aria-label="Tools and technologies"
            className="flex flex-wrap gap-2"
          >
            {tools.map((tool) => (
              <li key={tool}>
                <span className="font-mono text-sm px-2.5 py-1 rounded-md border border-border bg-muted/50 text-muted-foreground tracking-tight select-none">
                  {tool}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-4">
            <TypographyLead>
              My default stack — but I pick tools based on the problem and
              experiment freely.{" "}
              <TypographyMark>
                (And occasionally regret it halfway through.)
              </TypographyMark>
            </TypographyLead>
            <TypographyLead className="text-sm">
              I&apos;m not loyal to tools — only to good outcomes. If something
              feels repetitive or inefficient, I&apos;ll experiment until it
              doesn&apos;t.
            </TypographyLead>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
