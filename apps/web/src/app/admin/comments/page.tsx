import { getAllAdminComments } from "@/app/admin/actions";
import { AdminPage } from "@/app/admin/_components/admin-page";
import { Prefetch } from "@repo/query/prefetch";
import { queryKeys } from "@/lib/query-keys";
import { CommentsPanel } from "@/app/admin/comments/panel";

export default function AdminCommentsPage() {
  return (
    <AdminPage
      title="Comments"
      description="Every comment across blog posts, grouped by post."
    >
      <Prefetch queryKey={queryKeys.admin.comments} queryFn={getAllAdminComments}>
        <CommentsPanel />
      </Prefetch>
    </AdminPage>
  );
}
