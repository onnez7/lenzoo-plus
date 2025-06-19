'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

async function verifyMatrizAdmin() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.MATRIZ_ADMIN) throw new Error("Não autorizado.");
}

export async function createLab(values: z.infer<typeof formSchema>) {
    try {
        await verifyMatrizAdmin();
        await prisma.lab.create({ data: values });
        revalidatePath('/matriz/laboratorios');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não foi possível criar o laboratório." };
    }
}

export async function updateLab(labId: number, values: z.infer<typeof formSchema>) {
     try {
        await verifyMatrizAdmin();
        await prisma.lab.update({ where: { id: labId }, data: values });
        revalidatePath('/matriz/laboratorios');
        revalidatePath(`/matriz/laboratorios/${labId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não foi possível atualizar o laboratório." };
    }
}