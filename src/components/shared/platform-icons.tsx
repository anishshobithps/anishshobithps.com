import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@/components/shared/icons";
import type { ReactNode } from "react";

const iconMap: Record<string, (className?: string) => ReactNode> = {
  github: (className) => (
    <GithubLogoIcon weight="fill" className={className} aria-hidden="true" />
  ),
  linkedin: (className) => (
    <LinkedinLogoIcon weight="fill" className={className} aria-hidden="true" />
  ),
  x: (className) => (
    <XLogoIcon weight="fill" className={className} aria-hidden="true" />
  ),
};

export function getPlatformIcon(
  platform: string,
  className?: string,
): ReactNode {
  return iconMap[platform]?.(className) ?? null;
}
