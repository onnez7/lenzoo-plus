/*
 * =================================================================
 * FICHEIRO: Página do Dashboard
 * Localização: src/app/(franchise)/dashboard/page.tsx
 * =================================================================
 * Esta é a primeira página que o utilizador vê após o login.
 * Ela é um "Server Component", o que nos permite buscar dados do
 * servidor (como a sessão do utilizador) de forma segura e eficiente.
 */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";

// Como este é um Server Component, podemos torná-lo 'async'
export default async function DashboardPage() {
  // Busca os dados da sessão do utilizador diretamente no servidor.
  const session = await getServerSession(authOptions);

  // Extrai o primeiro nome do utilizador para uma saudação amigável.
  const firstName = session?.user?.name?.split(" ")[0] || "Utilizador";

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Boas-vindas */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo de volta, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está um resumo da sua ótica hoje.
        </p>
      </div>

      {/* Grelha de Cartões com Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1,480.50</div>
            <p className="text-xs text-muted-foreground">+20.1% desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novos Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">+180.1% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Abertos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 prontos para retirada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 itens</div>
            <p className="text-xs text-muted-foreground">Verificar armações</p>
          </CardContent>
        </Card>
      </div>

      {/* Aqui no futuro podemos adicionar mais componentes, como gráficos de vendas
          ou uma lista dos últimos pedidos. */}
    </div>
  );
}