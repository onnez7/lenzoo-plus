import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function MessageLogsPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) redirect("/login");

    const messageLogs = await prisma.messageLog.findMany({
        where: {
            automation: {
                franchiseId: franchiseId
            }
        },
        include: {
            client: { select: { name: true } },
            automation: { select: { name: true } },
        },
        orderBy: { sentAt: 'desc' },
        take: 100,
    });

    return (
        <div className="p-6">
             <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Log de Mensagens</h1>
                <p className="text-muted-foreground">Histórico de todas as mensagens automáticas enviadas.</p>
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Automação</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {messageLogs.map(log => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.sentAt).toLocaleString('pt-BR')}</TableCell>
                                    <TableCell>{log.client.name}</TableCell>
                                    <TableCell><Badge variant="outline">{log.automation.name}</Badge></TableCell>
                                    <TableCell><Badge variant={log.status.startsWith('SENT') ? 'default' : 'destructive'}>{log.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}