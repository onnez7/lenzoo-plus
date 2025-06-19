/*
 * =================================================================
 * FICHEIRO 2: O COMPONENTE DO DASHBOARD DA MATRIZ (CORRIGIDO)
 * Localização: src/app/(franchise)/dashboard/_components/matriz-dashboard.tsx
 * =================================================================
 */
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, DollarSign, Gem, Star } from "lucide-react";
import { SubscriptionPlan } from "@prisma/client";

// Define os preços para cada plano
const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  FREE: 0,
  ESSENTIAL: 99.90,
  PREMIUM: 199.90,
};

export default async function MatrizDashboard() {
  const totalFranchises = await prisma.franchise.count({ where: { isActive: true } });
  const planCounts = await prisma.franchise.groupBy({
    by: ['subscriptionPlan'],
    _count: { id: true },
    where: { isActive: true },
  });

  const planData = {
    FREE: planCounts.find(p => p.subscriptionPlan === 'FREE')?._count.id || 0,
    ESSENTIAL: planCounts.find(p => p.subscriptionPlan === 'ESSENTIAL')?._count.id || 0,
    PREMIUM: planCounts.find(p => p.subscriptionPlan === 'PREMIUM')?._count.id || 0,
  };

  const monthlyRecurringRevenue = 
      (planData.ESSENTIAL * PLAN_PRICES.ESSENTIAL) + 
      (planData.PREMIUM * PLAN_PRICES.PREMIUM);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Global</h1>
        <p className="text-muted-foreground">Visão geral da performance da rede Lenzoo+.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-r from-red-500 to-orange-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal (MRR)</CardTitle>
            <DollarSign className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(monthlyRecurringRevenue)}
            </div>
            <p className="text-xs text-red-100">Estimativa com base nos planos ativos.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Franquias Ativas</CardTitle>
            <Building className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalFranchises}</div>
            <p className="text-xs text-muted-foreground">Total de lojas na rede.</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Gratuito</CardTitle>
            <Star className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{planData.FREE}</div>
            <p className="text-xs text-muted-foreground">Franquias no plano inicial.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Essencial</CardTitle>
            <Gem className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{planData.ESSENTIAL}</div>
            <p className="text-xs text-muted-foreground">Faturamento: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(planData.ESSENTIAL * PLAN_PRICES.ESSENTIAL)}/mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Premium</CardTitle>
            <Gem className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{planData.PREMIUM}</div>
            <p className="text-xs text-muted-foreground">Faturamento: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(planData.PREMIUM * PLAN_PRICES.PREMIUM)}/mês</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}