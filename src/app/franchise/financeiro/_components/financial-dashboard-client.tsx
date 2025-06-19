'use client'

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowUp, ArrowDown, Scale } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import type { ChartDataPoint } from "../page";

interface FinancialDashboardClientProps {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  chartData: ChartDataPoint[];
}

export function FinancialDashboardClient({ totalRevenue, totalExpenses, grossProfit, chartData }: FinancialDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(() => {
    // Lógica para inicializar o filtro ativo com base nos parâmetros da URL
    const from = searchParams.get('from');
    if (!from) return '30d'; // Padrão
    const diff = (new Date().getTime() - new Date(from).getTime()) / (1000 * 3600 * 24);
    if (diff <= 1) return 'today';
    if (diff <= 2) return 'yesterday';
    if (diff <= 7) return '7d';
    return 'custom';
  });

  const setDateRange = (days: number | 'today' | 'yesterday') => {
    const today = new Date();
    let fromDate;
    if (days === 'today') {
      fromDate = startOfDay(today);
    } else if (days === 'yesterday') {
      fromDate = startOfDay(subDays(today, 1));
    } else {
      fromDate = startOfDay(subDays(today, days as number));
    }
    
    const params = new URLSearchParams();
    params.set('from', format(fromDate, 'yyyy-MM-dd'));
    params.set('to', format(days === 'yesterday' ? fromDate : today, 'yyyy-MM-dd'));
    router.push(`/franchise/financeiro?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant={activeFilter === 'today' ? 'default' : 'outline'} onClick={() => { setDateRange('today'); setActiveFilter('today'); }}>Hoje</Button>
        <Button variant={activeFilter === 'yesterday' ? 'default' : 'outline'} onClick={() => { setDateRange('yesterday'); setActiveFilter('yesterday'); }}>Ontem</Button>
        <Button variant={activeFilter === '7d' ? 'default' : 'outline'} onClick={() => { setDateRange(7); setActiveFilter('7d'); }}>7 dias</Button>
        <Button variant={activeFilter === '30d' ? 'default' : 'outline'} onClick={() => { setDateRange(30); setActiveFilter('30d'); }}>30 dias</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Receita Total</CardTitle><ArrowUp className="h-5 w-5 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Despesas Totais</CardTitle><ArrowDown className="h-5 w-5 text-red-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalExpenses)}</div></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Lucro Bruto</CardTitle><Scale className="h-5 w-5 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(grossProfit)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Receitas vs. Despesas</CardTitle></CardHeader>
        <CardContent className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(dateStr) => format(new Date(dateStr), "dd/MM")} fontSize={12} />
              <YAxis tickFormatter={(value) => `R$${value}`} fontSize={12}/>
              <Tooltip formatter={(value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)} />
              <Legend />
              <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}