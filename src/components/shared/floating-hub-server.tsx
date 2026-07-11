import { Suspense } from "react";
import { FloatingHub } from "@/components/shared/floating-hub";
import { RepoCard } from "@/components/repo-card";
import { siteConfig } from "@/lib/config";

const [owner = "", repo = ""] = siteConfig.githubRepo.split("/");

function RepoCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-24 animate-pulse rounded-lg border border-border/60 bg-muted/30"
    />
  );
}

export function FloatingHubServer() {
  return (
    <FloatingHub
      repoCard={
        <Suspense fallback={<RepoCardSkeleton />}>
          <RepoCard
            owner={owner}
            repo={repo}
            variant="muted"
            size="sm"
            showUpdated={false}
          />
        </Suspense>
      }
    />
  );
}
