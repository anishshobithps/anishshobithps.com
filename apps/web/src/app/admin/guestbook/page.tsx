import { getAllAdminGuestbookEntries } from "@/app/admin/actions";
import { AdminPage } from "@/app/admin/_components/admin-page";
import { Prefetch } from "@repo/query/prefetch";
import { queryKeys } from "@/lib/query-keys";
import { GuestbookPanel } from "@/app/admin/guestbook/panel";

export default function AdminGuestbookPage() {
  return (
    <AdminPage
      title="Guestbook"
      description="Moderate, pin, and remove guestbook entries."
    >
      <Prefetch queryKey={queryKeys.admin.guestbook} queryFn={getAllAdminGuestbookEntries}>
        <GuestbookPanel />
      </Prefetch>
    </AdminPage>
  );
}
