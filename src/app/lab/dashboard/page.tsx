
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Status } from "@prisma/client";
import { StatusUpdater } from "./_components/status-updater";

export default async function LabDashboardPage() {
    const session = await getServerSession(authOptions);
    const labId = session?.user?.labId ? parseInt(session.user.labId) : null;
    if (!labId) redirect("/lab/login");

    const orders = await prisma.order.findMany({
        where: { 
            labId: labId, 
            status: { notIn: [Status.COMPLETED, Status.CANCELLED] } // O lab só vê pedidos em aberto
        },
        include: { franchise: true },
        orderBy: { createdAt: 'asc' },
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ordens de Serviço Ativas</CardTitle>
                <CardDescription>Lista de todas as OS recebidas e em andamento.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>OS #</TableHead>
                            <TableHead>Ótica</TableHead>
                            <TableHead>Data de Envio</TableHead>
                            <TableHead>Status Atual</TableHead>
                            <TableHead className="text-right">Alterar Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map(order => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono">#{order.id}</TableCell>
                                <TableCell>{order.franchise?.name}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                                <TableCell><Badge variant="secondary">{order.status.replace("_", " ")}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <StatusUpdater orderId={order.id} currentStatus={order.status} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>
    );
}