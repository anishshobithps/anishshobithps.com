import { getAllAdminComments } from "@/app/admin/actions";
import { CommentsPanel } from "@/app/admin/comments/panel";

export default async function AdminCommentsPage() {
  const comments = await getAllAdminComments();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <CommentsPanel comments={comments} />
      </div>
    </div>
  );
}
