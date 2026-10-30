import { getAdminLinks } from "@/app/admin/links/actions";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { LinksPanel } from "@/app/admin/links/panel";

export default async function AdminLinksPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.admin.links,
    queryFn: getAdminLinks,
  });

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <LinksPanel />
        </HydrationBoundary>
      </div>
    </div>
  );
}
