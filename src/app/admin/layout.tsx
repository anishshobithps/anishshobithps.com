import { auth } from "@clerk/nextjs/server";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/app/admin/sidebar";
import { AdminHeader } from "@/app/admin/admin-header";
import { AdminUnauthorized } from "@/app/admin/unauthorized";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) return redirectToSignIn({ returnBackUrl: "/admin" });
  if (userId !== process.env.OWNER_CLERK_USER_ID) return <AdminUnauthorized />;

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
