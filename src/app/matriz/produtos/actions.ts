'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProductCategory, UserRole } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3), sku: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  costPrice: z.coerce.number().optional(),
  salePrice: z.coerce.number().min(0),
  description: z.string().optional(),
});

async function verifyMatrizAdmin() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.MATRIZ_ADMIN) throw new Error("Apenas a Matriz pode gerir produtos globais.");
}

export async function createGlobalProduct(values: z.infer<typeof formSchema>) {
    try {
        await verifyMatrizAdmin();
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        await prisma.product.create({
            data: { ...validatedFields.data, franchiseId: null },
        });
        revalidatePath('/matriz/produtos');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível criar o produto." };
    }
}

export async function updateGlobalProduct(productId: number, values: z.infer<typeof formSchema>) {
     try {
        await verifyMatrizAdmin();
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        await prisma.product.update({
            where: { id: productId, franchiseId: null },
            data: validatedFields.data,
        });
        revalidatePath('/matriz/produtos');
        revalidatePath(`/matriz/produtos/${productId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar o produto." };
    }
}


export async function updateProductAssignments(productId: number, assignments: { franchiseId: number; isAssigned: boolean }[]) {
    try {
        await verifyMatrizAdmin();

        await prisma.$transaction(async (tx) => {
            await tx.franchiseAvailableProduct.deleteMany({
                where: { productId: productId }
            });

            const newAssignments = assignments
                .filter(a => a.isAssigned)
                .map(a => ({
                    productId: productId,
                    franchiseId: a.franchiseId
                }));

            if (newAssignments.length > 0) {
                await tx.franchiseAvailableProduct.createMany({
                    data: newAssignments
                });
            }
        });
        
        revalidatePath(`/matriz/produtos`);
        revalidatePath(`/matriz/produtos/${productId}/atribuir`);
        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar as atribuições." };
    }
}