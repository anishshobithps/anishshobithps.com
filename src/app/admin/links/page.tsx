import { getAdminLinks } from "@/app/admin/links/actions";
import { LinksPanel } from "@/app/admin/links/panel";

export default async function AdminLinksPage() {
  const links = await getAdminLinks();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <LinksPanel links={links} />
      </div>
    </div>
  );
}
