import { getAllAdminGuestbookEntries } from "@/app/admin/actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { GuestbookPanel } from "@/app/admin/guestbook/panel";

export default async function AdminGuestbookPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.guestbook,
    queryFn: getAllAdminGuestbookEntries,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <GuestbookPanel />
        </HydrationBoundary>
      </div>
    </div>
  );
}
