'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { LostSaleReason } from '@prisma/client';

const formSchema = z.object({
  reason: z.nativeEnum(LostSaleReason),
  notes: z.string().optional(),
});

export async function registerLostSale(values: z.infer<typeof formSchema>) {
    try {
        const session = await getServerSession(authOptions);
        const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
        const userId = session?.user?.id ? parseInt(session.user.id, 10) : null;

        if (!franchiseId || !userId) throw new Error("Não autorizado.");
        
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        await prisma.lostSale.create({
            data: {
                ...validatedFields.data,
                franchiseId,
                userId,
            }
        });

        revalidatePath('/franchise/vendas-perdidas');
        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível registar a venda perdida." };
    }
}