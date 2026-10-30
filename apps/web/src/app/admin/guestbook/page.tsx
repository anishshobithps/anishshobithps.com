import { getAllAdminGuestbookEntries } from "@/app/admin/actions";
import { Prefetch } from "@repo/query/prefetch";
import { queryKeys } from "@/lib/query-keys";
import { GuestbookPanel } from "@/app/admin/guestbook/panel";

export default function AdminGuestbookPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Prefetch queryKey={queryKeys.admin.guestbook} queryFn={getAllAdminGuestbookEntries}>
          <GuestbookPanel />
        </Prefetch>
      </div>
    </div>
  );
}
