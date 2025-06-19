import { BarChart, Users, Package } from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportsHubPage() {
  const reports = [
    {
      title: "Vendas por Período",
      description: "Analise o faturamento por dia, semana ou mês.",
      href: "/franchise/relatorios/vendas",
      icon: BarChart,
    },
    {
      title: "Produtos Mais Vendidos",
      description: "Veja quais produtos estão a liderar as vendas.",
      href: "/franchise/relatorios/produtos-mais-vendidos", // <-- LINK ATIVADO
      icon: Package,
    },
    {
        title: "Performance por Colaborador",
        description: "Em breve: acompanhe as vendas de cada membro da equipa.",
        href: "#",
        icon: Users,
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
        <p className="text-muted-foreground">Selecione um relatório para analisar a performance da sua ótica.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Link key={report.title} href={report.href} className={!report.href || report.href === '#' ? "pointer-events-none opacity-50" : ""}>
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                   <report.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle>{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}