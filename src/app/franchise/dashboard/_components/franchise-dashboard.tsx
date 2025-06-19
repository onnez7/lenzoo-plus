/*
 * =================================================================
 * FICHEIRO 3: O COMPONENTE DO DASHBOARD DO FRANQUEADO
 * Localização: src/app/(franchise)/dashboard/_components/franchise-dashboard.tsx
 * =================================================================
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Session } from "next-auth";

const getTodayBounds = () => {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    return { start, end };
};
const getThisMonthBounds = () => {
    const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0); end.setHours(23, 59, 59, 999);
    return { start, end };
}

export default async function FranchiseDashboard({ session }: { session: Session }) {
  const franchiseId = session?.user.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
  const firstName = session?.user.name?.split(" ")[0] || "Utilizador";

  let salesToday = { _sum: { totalAmount: 0 } };
  let newClientsThisMonth = 0;
  let openOrdersCount = 0;
  let recentOrders: any[] = [];

  if (franchiseId) {
    const { start: startOfDay, end: endOfDay } = getTodayBounds();
    const { start: startOfMonth, end: endOfMonth } = getThisMonthBounds();
    
    salesToday = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { franchiseId, createdAt: { gte: startOfDay, lte: endOfDay }, status: { notIn: [Status.CANCELLED, Status.DRAFT]} },
    });
    newClientsThisMonth = await prisma.client.count({
        where: { franchiseId, createdAt: { gte: startOfMonth, lte: endOfMonth } },
    });
    openOrdersCount = await prisma.order.count({
        where: { franchiseId, status: { notIn: [Status.COMPLETED, Status.CANCELLED] } },
    });
    recentOrders = await prisma.order.findMany({
        where: { franchiseId }, take: 5, orderBy: { createdAt: 'desc' }, include: { client: true }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo de volta, {firstName}!</h1>
        <p className="text-muted-foreground">Aqui está um resumo da sua ótica hoje.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(salesToday._sum.totalAmount) || 0)}</div>
            <p className="text-xs text-muted-foreground">Total de hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{newClientsThisMonth}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Abertos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openOrdersCount}</div>
            <p className="text-xs text-muted-foreground">Aguardando finalização</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Em breve</div>
            <p className="text-xs text-muted-foreground">Funcionalidade futura</p>
          </CardContent>
        </Card>
      </div>

       <div className="pt-6">
        <Card>
            <CardHeader><CardTitle>Atividade Recente</CardTitle></CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>
                                    <div className="font-medium">{order.client.name}</div>
                                    <div className="text-sm text-muted-foreground">{order.client.email}</div>
                                </TableCell>
                                <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                                <TableCell className="text-right">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(order.totalAmount))}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}