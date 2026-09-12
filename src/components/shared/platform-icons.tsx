import {
  GithubLogoIcon,
  LinkedinLogoIcon,
  XLogoIcon,
} from "@/components/shared/icons";
import type { ReactNode } from "react";

const iconMap: Record<string, (className?: string) => ReactNode> = {
  github: (className) => (
    <GithubLogoIcon
      data-icon="inline-start"
      weight="fill"
      className={className}
      aria-hidden="true"
    />
  ),
  linkedin: (className) => (
    <LinkedinLogoIcon
      data-icon="inline-start"
      weight="fill"
      className={className}
      aria-hidden="true"
    />
  ),
  x: (className) => (
    <XLogoIcon
      data-icon="inline-start"
      weight="fill"
      className={className}
      aria-hidden="true"
    />
  ),
};

export function getPlatformIcon(
  platform: string,
  className?: string,
): ReactNode {
  return iconMap[platform]?.(className) ?? null;
}
