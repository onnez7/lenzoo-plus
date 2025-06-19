'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProductCategory } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3),
  sku: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  salePrice: z.coerce.number().min(0),
  description: z.string().optional(),
});

// Função de segurança para obter o ID da franquia da sessão
async function getFranchiseSession() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? Number(session.user.franchiseId) : null;

    if (!franchiseId) {
        throw new Error("Utilizador não está associado a uma franquia.");
    }
    return { franchiseId };
}

export async function createProduct(values: z.infer<typeof formSchema>) {
    try {
        const { franchiseId } = await getFranchiseSession();
        
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };
        
        await prisma.product.create({
            data: { ...validatedFields.data, franchiseId },
        });

        revalidatePath('/franchise/produtos');
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível criar o produto." };
    }
}

export async function updateProduct(productId: number, values: z.infer<typeof formSchema>) {
    try {
        const { franchiseId } = await getFranchiseSession();
        
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        // Verifica se o produto a ser editado pertence à mesma franquia do utilizador
        const productToUpdate = await prisma.product.findFirst({
            where: { 
                id: productId, 
                franchiseId: franchiseId 
            }
        });

        if (!productToUpdate) {
            return { success: false, error: "Permissão negada. Só pode editar produtos que a sua franquia criou." };
        }

        await prisma.product.update({
            where: { id: productId },
            data: { ...validatedFields.data },
        });

        revalidatePath('/franchise/produtos');
        revalidatePath(`/franchise/produtos/${productId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar o produto." };
    }
}