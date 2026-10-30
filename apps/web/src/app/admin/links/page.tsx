import { getAdminLinks } from "@/app/admin/links/actions";
import { Prefetch } from "@repo/query/prefetch";
import { queryKeys } from "@/lib/query-keys";
import { LinksPanel } from "@/app/admin/links/panel";

export default function AdminLinksPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Prefetch queryKey={queryKeys.admin.links} queryFn={getAdminLinks}>
          <LinksPanel />
        </Prefetch>
      </div>
    </div>
  );
}
