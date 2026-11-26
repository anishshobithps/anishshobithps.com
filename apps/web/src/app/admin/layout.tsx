import { ENV } from "varlock/env";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";
import { AdminSidebar } from "@/app/admin/sidebar";
import { AdminHeader } from "@/app/admin/admin-header";
import { AdminUnauthorized } from "@/app/admin/unauthorized";
import { QueryProvider } from "@/components/shared/query-provider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { markOwner } from "@/lib/analytics/server";
import type { Metadata } from "next";
import { after } from "next/server";

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
  if (userId !== ENV.OWNER_CLERK_USER_ID) return <AdminUnauthorized />;

  after(() => markOwner(userId));

  return (
    <ClerkProvider>
      <NuqsAdapter>
        <QueryProvider>
          <SidebarProvider data-analytics-block="">
            <AdminSidebar />
            <SidebarInset>
              <AdminHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </QueryProvider>
      </NuqsAdapter>
    </ClerkProvider>
  );
}
