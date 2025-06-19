import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { DataTable } from "@/components/shared/data-table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;

  const orders = franchiseId
    ? await prisma.order.findMany({
        where: { franchiseId: franchiseId },
        include: { client: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendas e Ordens de Serviço</h1>
          <p className="text-muted-foreground">Visualize e gira todos os pedidos da sua ótica.</p>
        </div>
        <Button asChild>
          {/* --- LINK CORRIGIDO AQUI --- */}
          <Link href="/franchise/pedidos/novo">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Venda / OS
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={orders} />
    </div>
  );
}