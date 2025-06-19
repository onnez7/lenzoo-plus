'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function setSalesGoal(employeeId: number, targetAmount: number) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.FRANCHISE_ADMIN) {
        return { success: false, error: "Apenas administradores podem definir metas." };
    }

    const franchiseId = parseInt(session.user.franchiseId as string);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    try {
        const employee = await prisma.user.findFirst({
            where: { id: employeeId, franchiseId: franchiseId }
        });
        if (!employee) return { success: false, error: "Colaborador não encontrado." };

        await prisma.salesGoal.upsert({
            where: {
                userId_year_month: {
                    userId: employeeId,
                    year: currentYear,
                    month: currentMonth
                }
            },
            update: {
                targetAmount: targetAmount
            },
            create: {
                userId: employeeId,
                franchiseId: franchiseId,
                year: currentYear,
                month: currentMonth,
                targetAmount: targetAmount
            }
        });

        revalidatePath('/franchise/metas');
        return { success: true };

    } catch (error) {
        return { success: false, error: "Não foi possível guardar a meta." };
    }
}