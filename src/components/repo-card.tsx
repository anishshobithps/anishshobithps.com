import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import {
  fetchGitHubRepoData,
  formatCount,
  type GitHubRepoData,
} from "@/lib/github"
import { formatRelativeDate } from "@/lib/date"
import {
  ArchiveIcon,
  ClockIcon,
  GitForkIcon,
  GithubLogoIcon,
  ScalesIcon,
  StarIcon,
} from "@/components/shared/icons"

const repoCardVariants = cva(
  "flex flex-col gap-3 rounded-lg border transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-border bg-card shadow-xs hover:border-foreground/20 hover:bg-accent/50",
        outline:
          "border-border bg-background shadow-xs hover:bg-accent/50 dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        ghost:
          "border-transparent hover:bg-accent/50 dark:hover:bg-accent/30",
        muted:
          "border-border/60 bg-muted/30 hover:bg-muted/60",
      },
      size: {
        sm: "p-3 [&_[data-slot=repo-name]]:text-sm [&_[data-slot=repo-description]]:text-xs [&_[data-slot=repo-meta]]:text-[11px]",
        default: "p-4 [&_[data-slot=repo-name]]:text-sm [&_[data-slot=repo-description]]:text-xs [&_[data-slot=repo-meta]]:text-xs",
        lg: "p-5 [&_[data-slot=repo-name]]:text-base [&_[data-slot=repo-description]]:text-sm [&_[data-slot=repo-meta]]:text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface RepoCardProps
  extends Omit<React.ComponentProps<"a">, "children">,
    VariantProps<typeof repoCardVariants> {
  /** GitHub username or organization. */
  owner: string
  /** GitHub repository name. */
  repo: string
  /** Show primary language with colored dot. @default true */
  showLanguage?: boolean
  /** Show topic tags. @default true */
  showTopics?: boolean
  /** Show license identifier. @default true */
  showLicense?: boolean
  /** Show last updated date. @default true */
  showUpdated?: boolean
  /** Maximum number of topic tags to display. @default 4 */
  maxTopics?: number
  /** Pre-fetched repository data. When provided, skips the GitHub API call. */
  data?: GitHubRepoData
}

async function RepoCard({
  owner,
  repo,
  variant,
  size,
  showLanguage = true,
  showTopics = true,
  showLicense = true,
  showUpdated = true,
  maxTopics = 4,
  data: dataProp,
  className,
  ...props
}: RepoCardProps) {
  const repoData = dataProp ?? (await fetchGitHubRepoData(owner, repo))
  if (!repoData) return null

  const topics = repoData.topics.slice(0, maxTopics)
  const hasMoreTopics = repoData.topics.length > maxTopics

  return (
    <a
      href={`https://github.com/${owner}/${repo}`}
      target="_blank"
      rel="noopener noreferrer"
      data-slot="repo-card"
      data-archived={repoData.isArchived || undefined}
      data-fork={repoData.isFork || undefined}
      aria-label={`${repoData.fullName} on GitHub — ${repoData.stars.toLocaleString("en-US")} stars`}
      className={cn(repoCardVariants({ variant, size, className }))}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <GithubLogoIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span data-slot="repo-name" className="font-semibold truncate">
            {repoData.fullName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {repoData.isArchived && (
            <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
              <ArchiveIcon aria-hidden="true" className="size-2.5" />
              Archived
            </span>
          )}
          {repoData.isFork && (
            <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <GitForkIcon aria-hidden="true" className="size-2.5" />
              Fork
            </span>
          )}
        </div>
      </div>

      {repoData.description && (
        <p data-slot="repo-description" className="text-muted-foreground line-clamp-2">
          {repoData.description}
        </p>
      )}

      {showTopics && topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              {topic}
            </span>
          ))}
          {hasMoreTopics && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              +{repoData.topics.length - maxTopics}
            </span>
          )}
        </div>
      )}

      <div data-slot="repo-meta" className="flex items-center gap-3 text-muted-foreground">
        {showLanguage && repoData.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: repoData.languageColor ?? "#8b8b8b" }}
              aria-hidden="true"
            />
            {repoData.language}
          </span>
        )}

        <span className="inline-flex items-center gap-1 tabular-nums">
          <StarIcon aria-hidden="true" className="size-3.5 opacity-60" />
          {formatCount(repoData.stars)}
        </span>

        {repoData.forks > 0 && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <GitForkIcon aria-hidden="true" className="size-3.5 opacity-60" />
            {formatCount(repoData.forks)}
          </span>
        )}

        {showLicense && repoData.license && repoData.license !== "NOASSERTION" && (
          <span className="inline-flex items-center gap-1">
            <ScalesIcon aria-hidden="true" className="size-3 opacity-50" />
            {repoData.license}
          </span>
        )}

        {showUpdated && repoData.updatedAt && (
          <span className="inline-flex items-center gap-1 ml-auto">
            <ClockIcon aria-hidden="true" className="size-3 opacity-50" />
            {formatRelativeDate(repoData.updatedAt)}
          </span>
        )}
      </div>
    </a>
  )
}

export { RepoCard, repoCardVariants }
export type { RepoCardProps, GitHubRepoData }
