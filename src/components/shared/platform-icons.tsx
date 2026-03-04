import {
  IconBrandGithubFilled,
  IconBrandLinkedinFilled,
  IconBrandTwitterFilled,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

const iconMap: Record<string, (className?: string) => ReactNode> = {
  github: (className) => <IconBrandGithubFilled className={className} aria-hidden="true" />,
  linkedin: (className) => <IconBrandLinkedinFilled className={className} aria-hidden="true" />,
  x: (className) => <IconBrandTwitterFilled className={className} aria-hidden="true" />,
};

export function getPlatformIcon(platform: string, className?: string): ReactNode {
  return iconMap[platform]?.(className) ?? null;
}
