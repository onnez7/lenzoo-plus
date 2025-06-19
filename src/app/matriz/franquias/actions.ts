'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SubscriptionPlan, UserRole } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan),
  isActive: z.boolean(),
});

// Função de segurança para verificar se o utilizador é admin da Matriz
async function verifyMatrizAdmin() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.MATRIZ_ADMIN) {
        throw new Error("Não autorizado.");
    }
}

export async function createFranchise(values: z.infer<typeof formSchema>) {
    try {
        await verifyMatrizAdmin();

        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        await prisma.franchise.create({ data: validatedFields.data });

        revalidatePath('/matriz/franquias');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível criar a franquia." };
    }
}

export async function updateFranchise(franchiseId: number, values: z.infer<typeof formSchema>) {
    try {
        await verifyMatrizAdmin();
        
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        await prisma.franchise.update({
            where: { id: franchiseId },
            data: validatedFields.data,
        });

        revalidatePath('/matriz/franquias');
        revalidatePath(`/matriz/franquias/${franchiseId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar a franquia." };
    }
}