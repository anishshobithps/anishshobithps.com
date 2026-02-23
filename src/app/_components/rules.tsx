"use client";

import { Section } from "@/components/layouts/page";
import {
  TypographyH3,
  TypographyLead,
  TypographyMuted,
  TypographyMark,
  SectionLabel,
} from "@/components/ui/typography";
import { DecorIcon } from "@/components/ui/border";

export function RulesIFollow() {
  return (
    <Section aria-label="Rules I Follow">
      <h2 className="sr-only">Rules I Follow</h2>
      <div className="flex items-center gap-3 mb-10" aria-hidden="true">
        <SectionLabel>Rules I Follow</SectionLabel>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <ul
        role="list"
        className="w-full max-w-5xl grid md:grid-cols-2 gap-6 lg:gap-8"
      >
        {rules.map((item) => (
          <li key={item.title} className="p-0 border-0 lg:p-6 lg:border">
            <div className="hidden lg:block" aria-hidden="true">
              <DecorIcon position="top-left" />
              <DecorIcon position="top-right" />
              <DecorIcon position="bottom-left" />
              <DecorIcon position="bottom-right" />
            </div>

            <div className="relative z-10 space-y-3">
              <TypographyH3 className="text-xl">{item.title}</TypographyH3>
              <TypographyMuted className="leading-relaxed">
                {item.description}
              </TypographyMuted>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-14 max-w-3xl">
        <TypographyLead>
          I build with{" "}
          <TypographyMark>
            clarity, structure, and a bias toward automation
          </TypographyMark>{" "}
          — because software should feel simple, even when the logic behind it
          isn't.
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
