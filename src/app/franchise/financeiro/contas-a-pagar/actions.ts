'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ExpenseCategory } from '@prisma/client';

const formSchema = z.object({
  description: z.string().min(3),
  amount: z.number().positive(),
  category: z.nativeEnum(ExpenseCategory),
  dueDate: z.date().optional(),
  isPaid: z.boolean(),
});

async function getFranchiseSession() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) throw new Error("Utilizador não associado a uma franquia.");
    return { franchiseId };
}

export async function createExpense(values: z.infer<typeof formSchema>) {
    try {
        const { franchiseId } = await getFranchiseSession();
        const { isPaid, ...data } = values;
        
        await prisma.expense.create({
            data: {
                ...data,
                paidAt: isPaid ? new Date() : null,
                franchiseId,
            }
        });
        revalidatePath('/franchise/financeiro/contas-a-pagar');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível criar a despesa." };
    }
}

export async function updateExpense(expenseId: number, values: z.infer<typeof formSchema>) {
    try {
        const { franchiseId } = await getFranchiseSession();
        const { isPaid, ...data } = values;

        const expenseToUpdate = await prisma.expense.findFirst({
            where: { id: expenseId, franchiseId }
        });
        if (!expenseToUpdate) return { success: false, error: "Despesa não encontrada ou sem permissão." };

        await prisma.expense.update({
            where: { id: expenseId },
            data: {
                ...data,
                paidAt: isPaid ? (expenseToUpdate.paidAt || new Date()) : null,
            },
        });
        revalidatePath('/franchise/financeiro/contas-a-pagar');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar a despesa." };
    }
}