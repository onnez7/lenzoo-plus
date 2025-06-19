/*
 * =================================================================
 * FICHEIRO 6: AS SERVER ACTIONS (ATUALIZADO)
 * Localização: src/app/(franchise)/clientes/actions.ts
 * =================================================================
 * Adicionei a nova função 'updateClient' a este ficheiro.
 */
'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
});

// A função de criar continua igual
export async function createClient(values: z.infer<typeof formSchema>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Não autorizado." };
    const franchiseId = session.user.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) return { success: false, error: "Utilizador não está associado a uma franquia." };
    const validatedFields = formSchema.safeParse(values);
    if (!validatedFields.success) return { success: false, error: "Dados inválidos." };
    try {
        await prisma.client.create({
            data: { ...validatedFields.data, franchiseId },
        });
        revalidatePath('/clientes');
        return { success: true };
    } catch (error) {
        console.error("[CREATE_CLIENT_ERROR]", error);
        return { success: false, error: "Ocorreu um erro no servidor." };
    }
}

// NOVA FUNÇÃO para atualizar um cliente
export async function updateClient(clientId: number, values: z.infer<typeof formSchema>) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Não autorizado." };
    const franchiseId = session.user.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) return { success: false, error: "Utilizador não está associado a uma franquia." };
    
    const validatedFields = formSchema.safeParse(values);
    if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

    try {
        // Verifica se o cliente a ser editado pertence à mesma franquia do utilizador
        const clientToUpdate = await prisma.client.findFirst({
            where: { id: clientId, franchiseId: franchiseId }
        });

        if (!clientToUpdate) {
            return { success: false, error: "Cliente não encontrado ou não tem permissão para editá-lo." };
        }

        await prisma.client.update({
            where: { id: clientId },
            data: { ...validatedFields.data },
        });

        revalidatePath('/clientes');
        revalidatePath(`/clientes/${clientId}`); // Revalida a página de edição também
        return { success: true };

    } catch (error) {
        console.error("[UPDATE_CLIENT_ERROR]", error);
        return { success: false, error: "Ocorreu um erro no servidor." };
    }
}
