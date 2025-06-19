import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentMethod } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link"; // <-- A CORREÇÃO ESTÁ AQUI

// Função auxiliar para obter os limites do dia de hoje
const getTodayBounds = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

export default async function CashierPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;

    if (!franchiseId) {
        redirect("/login");
    }

    const { start, end } = getTodayBounds();

    const paymentsToday = await prisma.payment.findMany({
        where: {
            order: {
                franchiseId: franchiseId,
            },
            createdAt: {
                gte: start,
                lte: end,
            }
        },
        include: {
            order: {
                select: {
                    id: true,
                    client: {
                        select: { name: true }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const totalsByMethod = paymentsToday.reduce((acc, payment) => {
        const amount = Number(payment.amount);
        acc[payment.method] = (acc[payment.method] || 0) + amount;
        return acc;
    }, {} as Record<PaymentMethod, number>);

    const grandTotal = paymentsToday.reduce((sum, payment) => sum + Number(payment.amount), 0);

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Caixa do Dia</h1>
                <p className="text-muted-foreground">Resumo dos pagamentos recebidos hoje, {new Date().toLocaleDateString('pt-BR')}.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
                 {Object.entries(totalsByMethod).map(([method, total]) => (
                    <Card key={method}>
                        <CardHeader>
                            <CardTitle className="text-base font-medium">{method.replace("_", " ")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}</p>
                        </CardContent>
                    </Card>
                 ))}
             </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lançamentos do Dia</CardTitle>
                    <CardDescription>Lista de todos os pagamentos recebidos hoje.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hora</TableHead>
                                <TableHead>OS #</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paymentsToday.length > 0 ? (
                                paymentsToday.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{new Date(payment.createdAt).toLocaleTimeString('pt-BR')}</TableCell>
                                        <TableCell>
                                            <Link href={`/franchise/pedidos/${payment.order.id}`} className="font-mono hover:underline">
                                                #{payment.order.id}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{payment.order.client.name}</TableCell>
                                        <TableCell><Badge variant="outline">{payment.method}</Badge></TableCell>
                                        <TableCell className="text-right font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(payment.amount))}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Nenhum lançamento hoje.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter className="flex justify-end bg-muted/50 p-4 font-bold text-lg">
                    <span>Total em Caixa Hoje: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(grandTotal)}</span>
                </CardFooter>
            </Card>
        </div>
    );
}