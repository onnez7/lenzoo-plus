import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppSidebar from "@/components/shared/app-sidebar";
import { FlaskConical } from "lucide-react";

export default async function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verifica se a sessão existe e se o usuário é LAB_USER
  if (!session || session.user?.role !== 'LAB_USER') {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Barra lateral */}
      <AppSidebar user={session.user} />
      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <FlaskConical className="h-6 w-6 text-green-600" />
            <span className="text-lg">Portal do Laboratório</span>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}