import { getAdminProjects } from "@/app/admin/actions";
import { Prefetch } from "@repo/query/prefetch";
import { queryKeys } from "@/lib/query-keys";
import { ProjectsPanel } from "@/app/admin/projects/panel";

export default function AdminProjectsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Prefetch queryKey={queryKeys.admin.projects} queryFn={getAdminProjects}>
          <ProjectsPanel />
        </Prefetch>
      </div>
    </div>
  );
}
