import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Status } from "@prisma/client";
import { SalesReportClient } from "./_components/sales-report-client";

export type SalesData = { date: string; total: number; };

export default async function SalesReportPage({
  searchParams
}: {
  searchParams: { from?: string, to?: string }
}) {
  const session = await getServerSession(authOptions);
  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;

  if (!franchiseId) redirect("/login");

  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  const from = searchParams.from ? new Date(searchParams.from) : new Date(new Date().setDate(to.getDate() - 7));
  to.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      franchiseId,
      createdAt: { gte: from, lte: to },
      status: { notIn: [Status.CANCELLED, Status.DRAFT] },
    },
    orderBy: { createdAt: 'asc' }
  });

  const salesByDay: { [key: string]: number } = {};
  orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDay[date] = (salesByDay[date] || 0) + Number(order.totalAmount);
  });

  const chartData: SalesData[] = Object.keys(salesByDay).map(date => ({
      date,
      total: salesByDay[date],
  }));

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const totalOrders = orders.length;

  return (
    <div className="p-6">
       <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Relatório de Vendas por Período</h1>
        <p className="text-muted-foreground">Filtre por data para analisar o faturamento.</p>
      </div>
      <SalesReportClient 
        initialData={chartData} 
        totalRevenue={totalRevenue} 
        totalOrders={totalOrders}
        dateRange={{ from, to }}
      />
    </div>
  );
}