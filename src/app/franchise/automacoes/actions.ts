'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AutomationTrigger } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3),
  trigger: z.nativeEnum(AutomationTrigger),
  delayInDays: z.number().optional(),
  message: z.string().min(10),
  isActive: z.boolean(),
});

async function getFranchiseSession() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) throw new Error("Utilizador não associado a uma franquia.");
    return { franchiseId };
}

export async function createAutomation(values: z.infer<typeof formSchema>) {
    try {
        const { franchiseId } = await getFranchiseSession();
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        await prisma.automation.create({ data: { ...validatedFields.data, franchiseId } });
        revalidatePath('/franchise/automacoes');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível criar a automação." };
    }
}

export async function updateAutomation(automationId: number, values: z.infer<typeof formSchema>) {
    try {
        const { franchiseId } = await getFranchiseSession();
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        const automationToUpdate = await prisma.automation.findFirst({
            where: { id: automationId, franchiseId }
        });
        if (!automationToUpdate) return { success: false, error: "Automação não encontrada ou sem permissão." };

        await prisma.automation.update({
            where: { id: automationId },
            data: validatedFields.data,
        });
        revalidatePath('/franchise/automacoes');
        revalidatePath(`/franchise/automacoes/${automationId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar a automação." };
    }
}