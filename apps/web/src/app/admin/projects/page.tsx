import { getAdminProjects } from "@/app/admin/actions";
import { AdminPage } from "@/app/admin/_components/admin-page";
import { Prefetch } from "@/lib/query/prefetch";
import { queryKeys } from "@/lib/query/keys";
import { ProjectsPanel } from "@/app/admin/projects/panel";

export default function AdminProjectsPage() {
  return (
    <AdminPage
      title="Projects"
      description="The projects shown on the site, in display order."
    >
      <Prefetch queryKey={queryKeys.admin.projects} queryFn={getAdminProjects}>
        <ProjectsPanel />
      </Prefetch>
    </AdminPage>
  );
}
