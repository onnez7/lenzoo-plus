/*
 * =================================================================
 * FICHEIRO 6: AS SERVER ACTIONS PARA COLABORADORES
 * Localização: src/app/(franchise)/usuarios/actions.ts
 * =================================================================
 */
'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Status, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const createUserSchema = z.object({
  name: z.string().min(3), email: z.string().email(),
  password: z.string().min(6), status: z.nativeEnum(Status),
});
const updateUserSchema = z.object({
  name: z.string().min(3), email: z.string().email(),
  password: z.string().optional(), status: z.nativeEnum(Status),
});

async function getAdminSession() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    const isAdmin = session?.user?.role === UserRole.FRANCHISE_ADMIN;

    if (!isAdmin || !franchiseId) return { error: "Apenas administradores de franquia podem executar esta ação." };
    return { franchiseId };
}

export async function createUser(values: z.infer<typeof createUserSchema>) {
    const sessionResult = await getAdminSession();
    if ('error' in sessionResult) return { success: false, error: sessionResult.error };

    const existingUser = await prisma.user.findUnique({ where: { email: values.email } });
    if (existingUser) return { success: false, error: "Este e-mail já está em uso." };

    const hashedPassword = await bcrypt.hash(values.password, 10);

    try {
        await prisma.user.create({
            data: {
                name: values.name,
                email: values.email,
                status: values.status,
                passwordHash: hashedPassword,
                franchiseId: sessionResult.franchiseId,
                role: UserRole.EMPLOYEE, // Colaboradores são sempre criados com este papel
            },
        });
        revalidatePath('/usuarios');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não foi possível criar o colaborador." };
    }
}

export async function updateUser(userId: number, values: z.infer<typeof updateUserSchema>) {
    const sessionResult = await getAdminSession();
    if ('error' in sessionResult) return { success: false, error: sessionResult.error };

    const { password, ...otherValues } = values;
    let updateData: any = otherValues;

    if (password && password.length >= 6) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    try {
        await prisma.user.update({
            where: { id: userId, franchiseId: sessionResult.franchiseId },
            data: updateData,
        });
        revalidatePath('/usuarios');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Não foi possível atualizar o colaborador." };
    }
}