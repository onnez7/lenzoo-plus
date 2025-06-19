import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SiteHeader } from "@/components/shared/site-header";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role === UserRole.MATRIZ_ADMIN) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen">
        <AppSidebar user={session.user} />
        <div className="flex-1 flex flex-col">
          <SiteHeader />
          <main className="flex-1 p-4 sm:p-6 bg-muted/40 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}