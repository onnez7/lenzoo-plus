import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";

export default async function BestSellingProductsPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;

    if (!franchiseId) {
        redirect("/login");
    }

    // Agrega os itens de pedidos para somar as quantidades vendidas por produto
    const bestSellingProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true,
        },
        where: {
            order: {
                franchiseId: franchiseId,
                status: { notIn: [Status.CANCELLED, Status.DRAFT] }
            },
            productId: {
                not: null // Considera apenas itens que são produtos
            }
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 20, // Limita aos 20 produtos mais vendidos
    });

    // Busca os detalhes dos produtos mais vendidos
    const productIds = bestSellingProducts.map(p => p.productId as number);
    const productsDetails = await prisma.product.findMany({
        where: {
            id: { in: productIds }
        }
    });

    // Combina os dados de contagem com os detalhes dos produtos
    const reportData = bestSellingProducts.map(item => {
        const product = productsDetails.find(p => p.id === item.productId);
        return {
            ...product,
            totalSold: item._sum.quantity || 0,
        }
    }).sort((a, b) => b.totalSold - a.totalSold); // Garante a ordenação final

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Relatório de Produtos Mais Vendidos</h1>
                <p className="text-muted-foreground">Veja o ranking de performance dos seus produtos.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Top 20 Produtos</CardTitle>
                    <CardDescription>Lista dos produtos mais vendidos em toda a história da loja.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Ranking</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-right">Quantidade Vendida</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportData.map((item, index) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-bold text-lg text-muted-foreground">#{index + 1}</TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.sku || 'N/A'}</TableCell>
                                    <TableCell className="text-right font-bold">{item.totalSold}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}