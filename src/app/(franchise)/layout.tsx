/*
 * =================================================================
 * FICHEIRO 1: O LAYOUT PRINCIPAL (O esqueleto da página)
 * Localização: src/app/(franchise)/layout.tsx
 * =================================================================
 * Este ficheiro é o componente principal que envolve todas as páginas
 * da área do franqueado. Ele busca a sessão do utilizador no servidor,
 * protege a rota e renderiza a estrutura com a Sidebar e o Header.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";

export default async function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Busca a sessão do utilizador no lado do servidor.
  //    Isto é extremamente seguro e eficiente.
  const session = await getServerSession(authOptions);

  // 2. Proteção da Rota
  //    Se não houver sessão (utilizador não logado), redireciona
  //    imediatamente para a página de login.
  if (!session || !session.user) {
    redirect("/login");
  }

  // 3. Renderiza a estrutura do painel se o utilizador estiver autenticado.
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar (Menu lateral fixo) */}
      <Sidebar user={session.user} />

      {/* Área principal que contém o Header e o conteúdo da página */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={session.user} />
        {/* O conteúdo da página atual (ex: Dashboard) será renderizado aqui */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
