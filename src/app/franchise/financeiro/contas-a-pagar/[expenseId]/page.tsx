import ExpenseForm from "../_components/expense-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
export default async function EditExpensePage({ params }: { params: { expenseId: string } }) {
    const expense = await prisma.expense.findUnique({ where: { id: parseInt(params.expenseId) } });
    if (!expense) notFound();
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Despesa</h1>
            <ExpenseForm expense={expense} />
        </div>
    );
}