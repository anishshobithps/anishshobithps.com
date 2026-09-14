import { getAdminProjects } from "@/app/admin/actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { ProjectsPanel } from "@/app/admin/projects/panel";

export default async function AdminProjectsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.projects,
    queryFn: getAdminProjects,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ProjectsPanel />
        </HydrationBoundary>
      </div>
    </div>
  );
}
