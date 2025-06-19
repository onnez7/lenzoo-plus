import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { columns } from "../_components/columns";
import { DataTable } from "@/components/shared/data-table";
import { Status } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

export default async function AccountsReceivablePage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) redirect("/login");

    const orders = await prisma.order.findMany({
        where: { franchiseId, status: { notIn: [Status.COMPLETED, Status.CANCELLED] } },
        include: { client: true, payments: true, },
    });
    
    const accountsReceivable = orders.map(order => {
        const totalPaid = order.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
        const balanceDue = Number(order.totalAmount) - totalPaid;
        return { ...order, totalPaid, balanceDue };
    }).filter(order => order.balanceDue > 0);
    
    const totalReceivable = accountsReceivable.reduce((sum, order) => sum + order.balanceDue, 0);

    return (
        <div className="p-6">
            <div className="mb-8"><h1 className="text-3xl font-bold tracking-tight">Contas a Receber</h1></div>
            <Card className="mb-6 max-w-sm"><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total a Receber</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalReceivable)}</div></CardContent></Card>
            <DataTable columns={columns} data={accountsReceivable} />
        </div>
    );
}