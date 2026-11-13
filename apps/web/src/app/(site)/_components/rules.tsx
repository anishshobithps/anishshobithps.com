import { Section } from "@/components/layouts/page";
import { Reveal } from "@/components/shared/reveal";
import { ArtStage } from "@/components/layouts/hero-art";
import { PageArt } from "@repo/diagrams/page-art";
import {
  Heading,
  TypographyH2,
  TypographyLead,
  TypographyMuted,
  SectionLabel,
} from "@repo/ui/components/typography";
import { padIndex } from "@repo/core/text";
import { Button } from "@repo/ui/components/button";
import { ArrowRightIcon, ArrowUpRightIcon } from "@repo/icons";
import Link from "next/link";
import type { Route } from "next";

interface Proof {
  label: string;
  href: string;
  external?: boolean;
}

function ProofLink({ proof }: { proof: Proof }) {
  const Icon = proof.external ? ArrowUpRightIcon : ArrowRightIcon;
  return (
    <div className="col-start-2">
      <Button asChild variant="link" size="inline">
        <Link
          href={proof.href as Route}
          prefetch={false}
          {...(proof.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {proof.label}
          {proof.external && (
            <span className="sr-only"> (opens in new tab)</span>
          )}
          <Icon data-icon="inline-end" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

export function RulesIFollow() {
  return (
    <Section aria-label="Rules I follow" doodle="snail">
      <div className="flex max-w-3xl flex-col gap-3">
        <TypographyH2>Rules I follow</TypographyH2>
        <TypographyLead>
          I build with structure and a bias toward automation, because
          software should feel simple even when the logic behind it isn&apos;t.
        </TypographyLead>
      </div>
      <div className="group/iso grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-16">
        <ol role="list" className="flex flex-col gap-8">
          {rules.map((item, index) => (
            <li key={item.title}>
              <Reveal delay={index * 90}>
                <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-2">
                  <SectionLabel pixel className="pt-1.5 text-base text-(--brand-text)">
                    {padIndex(index + 1)}
                  </SectionLabel>
                  <Heading as="h3" level="h4">
                    {item.title}
                  </Heading>
                  <TypographyMuted className="col-start-2 leading-relaxed">
                    {item.description}
                  </TypographyMuted>
                  <ProofLink proof={item.proof} />
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
        <ArtStage className="order-first -mx-gutter h-44 md:sticky md:top-24 md:order-none md:mx-0 md:h-auto md:aspect-video">
          <PageArt name="principles" />
        </ArtStage>
      </div>
    </Section>
  );
}

const rules: { title: string; description: string; proof: Proof }[] = [
  {
    title: "If it's repetitive, automate it",
    description:
      "Manual repetition is usually a signal. Whether it's a CLI tool, a script, or a small utility, I'd rather build it once than repeat it twice.",
    proof: {
      label: "The 4am RCB ticket alert",
      href: "/blog/rcb-tickets-are-broken-so-i-built-an-alert-system-at-4am",
    },
  },
  {
    title: "Clarity beats cleverness",
    description:
      "Readable code and predictable behavior matter more than impressive abstractions. Future-me should understand it without a debugging session.",
    proof: {
      label: "Making my resume machine-readable",
      href: "/blog/making-my-resume-machine-readable",
    },
  },
  {
    title: "Think in systems, not screens",
    description:
      "Components should work together as a structured whole. State, data flow, and UI patterns should scale without becoming fragile.",
    proof: {
      label: "The Tiara 2024 fest site",
      href: "https://tiara.anishshobithps.com/",
      external: true,
    },
  },
  {
    title: "Simple on the surface",
    description:
      "Good software feels effortless to use. The complexity can exist. It just shouldn't leak into the interface.",
    proof: {
      label: "snipshot on GitHub",
      href: "https://github.com/anishshobithps/snipshot",
      external: true,
    },
  },
];
