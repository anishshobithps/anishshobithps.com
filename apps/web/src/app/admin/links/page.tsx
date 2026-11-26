import { getAdminLinks } from "@/app/admin/links/actions";
import { AdminPage } from "@/app/admin/_components/admin-page";
import { Prefetch } from "@/lib/query/prefetch";
import { queryKeys } from "@/lib/query/keys";
import { LinksPanel } from "@/app/admin/links/panel";

export default function AdminLinksPage() {
  return (
    <AdminPage
      title="Links"
      description="Short links that redirect from this domain."
    >
      <Prefetch queryKey={queryKeys.admin.links} queryFn={getAdminLinks}>
        <LinksPanel />
      </Prefetch>
    </AdminPage>
  );
}
