'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { SalesData } from "../page";

interface SalesReportClientProps {
  initialData: SalesData[];
  totalRevenue: number;
  totalOrders: number;
}

export function SalesReportClient({ initialData, totalRevenue, totalOrders }: SalesReportClientProps) {
  const router = useRouter();
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });

  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (newDate?.from && newDate?.to) {
        // Quando a data muda, atualiza a URL com os novos parâmetros
        const params = new URLSearchParams();
        params.set('from', format(newDate.from, 'yyyy-MM-dd'));
        params.set('to', format(newDate.to, 'yyyy-MM-dd'));
        router.push(`/franchise/relatorios/vendas?${params.toString()}`);
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filtros</h2>
            <DatePickerWithRange date={date} onDateChange={handleDateChange} />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader><CardTitle>Receita Total</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Total de Pedidos</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">{totalOrders}</p>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Gráfico de Vendas</CardTitle>
                <CardDescription>Receita diária no período selecionado.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={initialData}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: ptBR })}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `R$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #ccc", borderRadius: "0.5rem" }}
                            labelFormatter={(value) => format(new Date(value), "dd/MM/yyyy", { locale: ptBR })}
                            formatter={(value: number) => [new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value), "Receita"]}
                        />
                        <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    </div>
  )
}