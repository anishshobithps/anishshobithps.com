"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Mail, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/layouts/page";
import { siteConfig } from "@/lib/config";
import {
  TypographyH1,
  TypographyLead,
  TypographyMuted,
} from "@/components/ui/typography";
import { DecorIcon } from "@/components/ui/border";

export function Hero() {
  return (
    <Section variant="hero">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-lg font-mono font-medium tracking-widest text-muted-foreground/80 uppercase">
          Who am I ?
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_260px] gap-8 lg:gap-12 items-stretch">
        <div
          className="
            relative flex flex-col justify-between
            bg-background/80 backdrop-blur-md

            /* MOBILE + TABLET */
            p-0 border-0

            /* DESKTOP ONLY */
            lg:p-8 lg:border
          "
        >
          <div className="hidden lg:block">
            <DecorIcon position="top-left" />
            <DecorIcon position="top-right" />
            <DecorIcon position="bottom-left" />
            <DecorIcon position="bottom-right" />
          </div>

          <div className="space-y-5 relative z-10">
            {siteConfig.availableForHire && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs"
              >
                <Circle className="size-2 fill-green-500 text-green-500 animate-pulse" />
                Available for hire
              </Badge>
            )}

            <div>
              <TypographyH1 className="text-4xl sm:text-5xl tracking-tight">
                {siteConfig.name}
              </TypographyH1>

              <TypographyMuted className="mt-2">
                {siteConfig.role}
              </TypographyMuted>
            </div>

            <TypographyLead className="text-muted-foreground leading-relaxed max-w-lg">
              I craft sleek{" "}
              <mark className="bg-(--selection-bg) text-(--selection-fg) rounded-sm px-1 not-italic">
                high-performance web experiences
              </mark>{" "}
              that users love and developers enjoy expanding.
            </TypographyLead>
          </div>

          <div className="mt-8 flex gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="rounded-lg sm:gap-2 px-3 sm:px-6 font-semibold"
            >
              <Link href="/resume" prefetch={false}>
                <FileText className="size-5" />
                <span className="hidden sm:inline">Resume</span>
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-lg sm:gap-2 px-3 sm:px-6 font-semibold"
            >
              <Link href="#contact" prefetch={false}>
                <Mail className="size-5" />
                <span className="hidden sm:inline">Contact</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="hidden lg:block relative border bg-background/80 backdrop-blur-md">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />

          <div className="relative w-full h-full">
            <Image
              src="/profile.jpg"
              alt="Profile"
              fill
              className="object-cover"
              priority
              sizes="260px"
            />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6))]" />
          </div>
        </div>
      </div>
    </Section>
  );
}
