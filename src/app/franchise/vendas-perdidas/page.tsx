import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { columns } from "./_components/columns";
import { DataTable } from "@/components/shared/data-table";
import { RegisterLostSaleButton } from "./_components/register-lost-sale-button";

export default async function LostSalesPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) redirect("/login");

    const lostSales = await prisma.lostSale.findMany({
        where: { franchiseId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Registo de Vendas Perdidas</h1>
                    <p className="text-muted-foreground">Entenda porque os seus clientes não estão a comprar.</p>
                </div>
                <RegisterLostSaleButton />
            </div>
            <DataTable columns={columns} data={lostSales} />
        </div>
    );
}