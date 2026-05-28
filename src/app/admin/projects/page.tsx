import { getAdminProjects } from "@/app/admin/actions";
import { ProjectsPanel } from "@/app/admin/projects/panel";

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <ProjectsPanel projects={projects} />
      </div>
    </div>
  );
}
