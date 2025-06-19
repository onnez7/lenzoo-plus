import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlusCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AutomationsPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) redirect("/login");

    const automations = await prisma.automation.findMany({
        where: { franchiseId },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pós-Venda Automatizado</h1>
                    <p className="text-muted-foreground">Crie mensagens automáticas para encantar os seus clientes.</p>
                </div>
                <Button asChild>
                    <Link href="/franchise/automacoes/nova">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nova Automação
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {automations.map(automation => (
                    <Link key={automation.id} href={`/franchise/automacoes/${automation.id}`}>
                        <Card className="hover:border-primary transition-colors h-full">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5"/> {automation.name}</CardTitle>
                                    <Badge variant={automation.isActive ? "default" : "secondary"}>
                                        {automation.isActive ? "Ativa" : "Inativa"}
                                    </Badge>
                                </div>
                                <CardDescription>{automation.trigger.replace("_", " ")}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground italic line-clamp-3">"{automation.message}"</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}