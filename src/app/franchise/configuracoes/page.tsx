import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { IntegrationForm } from "./_components/integration-form";
import { prisma } from "@/lib/prisma";

export default async function IntegrationsPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.FRANCHISE_ADMIN) {
        redirect("/franchise/dashboard");
    }
    
    const franchiseId = parseInt(session.user.franchiseId as string);

    const franchise = await prisma.franchise.findUnique({
        where: { id: franchiseId },
        select: {
            whatsAppProvider: true,
            whatsAppApiToken: true,
            whatsAppInstanceId: true,
            whatsAppApiSecret: true,
            whatsAppFromNumber: true,
            whatsAppClientToken: true, // Buscamos o novo campo
        }
    });

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Integrações</h1>
                <p className="text-muted-foreground">Conecte o Lenzoo+ com outras ferramentas.</p>
            </div>
            <IntegrationForm initialData={franchise} />
        </div>
    );
}