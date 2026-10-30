import { getAllAdminComments } from "@/app/admin/actions";
import { Prefetch } from "@repo/query/prefetch";
import { queryKeys } from "@/lib/query-keys";
import { CommentsPanel } from "@/app/admin/comments/panel";

export default function AdminCommentsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Prefetch queryKey={queryKeys.admin.comments} queryFn={getAllAdminComments}>
          <CommentsPanel />
        </Prefetch>
      </div>
    </div>
  );
}
