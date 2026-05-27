import { getAllAdminGuestbookEntries } from "@/app/admin/actions";
import { GuestbookPanel } from "./panel";

export default async function AdminGuestbookPage() {
  const entries = await getAllAdminGuestbookEntries();

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-6">
        <GuestbookPanel entries={entries} />
      </div>
    </div>
  );
}
