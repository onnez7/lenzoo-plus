import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { columns as expenseColumns } from "./_components/columns";
import { ExpenseDialog } from "./_components/expense-dialog";

export default async function AccountsPayablePage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) redirect("/login");
    
    const expenses = await prisma.expense.findMany({
        where: { franchiseId },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="p-6">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
                    <p className="text-muted-foreground">Registe e gira as despesas da sua loja.</p>
                </div>
                <ExpenseDialog>
                    <Button>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nova Despesa
                    </Button>
                </ExpenseDialog>
            </div>
            <DataTable columns={expenseColumns} data={expenses} />
        </div>
    );
}