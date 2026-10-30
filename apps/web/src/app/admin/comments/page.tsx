import { getAllAdminComments } from "@/app/admin/actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { CommentsPanel } from "@/app/admin/comments/panel";

export default async function AdminCommentsPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.comments,
    queryFn: getAllAdminComments,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <CommentsPanel />
        </HydrationBoundary>
      </div>
    </div>
  );
}
