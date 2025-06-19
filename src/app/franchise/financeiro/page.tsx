import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Status } from "@prisma/client";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { FinancialDashboardClient } from "./_components/financial-dashboard-client";

// Tipagem para os dados do gráfico
export type ChartDataPoint = {
  date: string;
  Receita: number;
  Despesa: number;
};

export default async function FinancialDashboardPage({
  searchParams,
}: {
  searchParams?: { from?: string; to?: string };
}) {
  const session = await getServerSession(authOptions);
  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
  if (!franchiseId) redirect("/login");

  // Define o intervalo de datas (padrão: últimos 30 dias)
  const to = searchParams?.to ? new Date(searchParams.to) : new Date();
  const from = searchParams?.from ? new Date(searchParams.from) : subDays(new Date(), 30);
  to.setHours(23, 59, 59, 999);
  from.setHours(0, 0, 0, 0);

  // Busca Vendas e Despesas no período
  const [orders, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { franchiseId, createdAt: { gte: from, lte: to }, status: { notIn: [Status.CANCELLED, Status.DRAFT] } },
    }),
    prisma.expense.findMany({
      where: { franchiseId, createdAt: { gte: from, lte: to } },
    }),
  ]);

  // Calcula os totais
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const grossProfit = totalRevenue - totalExpenses;

  // Agrupa os dados por dia para o gráfico
  const dailyData: Record<string, { Receita: number; Despesa: number }> = {};
  
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!dailyData[date]) dailyData[date] = { Receita: 0, Despesa: 0 };
    dailyData[date].Receita += Number(order.totalAmount);
  });

  expenses.forEach(expense => {
    const date = expense.createdAt.toISOString().split('T')[0];
    if (!dailyData[date]) dailyData[date] = { Receita: 0, Despesa: 0 };
    dailyData[date].Despesa += Number(expense.amount);
  });

  const chartData: ChartDataPoint[] = Object.keys(dailyData).sort().map(date => ({
    date,
    ...dailyData[date]
  }));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">Analise o fluxo de caixa e a lucratividade da sua loja.</p>
      </div>
      <FinancialDashboardClient
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        grossProfit={grossProfit}
        chartData={chartData}
      />
    </div>
  );
}