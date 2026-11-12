import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import type { MDXComponents } from "mdx/types";
import { TypographyMark, TypographyMuted } from "@repo/ui/components/typography";
import { cn } from "@repo/ui/lib/cn";
import { LinkCard, type LinkCardProps } from "@/components/link-card/link-card";

function MdxLinkCard({ className, ...props }: LinkCardProps) {
  return <LinkCard {...props} className={cn("my-6", className)} />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    Step,
    Steps,
    File,
    Files,
    Folder,
    LinkCard: MdxLinkCard,
    TypographyMark,
    TypographyMuted,
    ...components,
  };
}
