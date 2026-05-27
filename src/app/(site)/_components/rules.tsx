import { Section } from "@/components/layouts/page";
import { Reveal } from "@/components/shared/reveal";
import {
  TypographyH3,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
  SectionHeader,
} from "@/components/ui/typography";

export function RulesIFollow() {
  return (
    <Section aria-label="Rules I Follow">
      <SectionHeader>Rules I Follow</SectionHeader>
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        {rules.map((item, index) => (
          <Reveal key={item.title} delay={index * 90}>
            <div className="flex gap-5">
              <span
                className="text-4xl font-mono font-bold text-muted-foreground/15 leading-none tabular-nums select-none shrink-0 pt-1"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="space-y-2">
                <TypographyH3 className="text-xl">{item.title}</TypographyH3>
                <TypographyMuted className="leading-relaxed">
                  {item.description}
                </TypographyMuted>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="max-w-3xl">
        <TypographyLead>
          I build with{" "}
          <TypographyMark>
            clarity, structure, and a bias toward automation
          </TypographyMark>{" "}
          — because software should feel simple, even when the logic behind it
          isn&apos;t.
        </TypographyLead>
      </div>
    </Section>
  );
}

const rules = [
  {
    title: "If It's Repetitive, Automate It",
    description:
      "Manual repetition is usually a signal. Whether it's a CLI tool, a script, or a small utility — I'd rather build it once than repeat it twice.",
  },
  {
    title: "Clarity Beats Cleverness",
    description:
      "Readable code and predictable behavior matter more than impressive abstractions. Future-me should understand it without a debugging session.",
  },
  {
    title: "Think in Systems, Not Screens",
    description:
      "Components should work together as a structured whole. State, data flow, and UI patterns should scale without becoming fragile.",
  },
  {
    title: "Simple on the Surface",
    description:
      "Good software feels effortless to use. The complexity can exist — it just shouldn't leak into the interface.",
  },
];
