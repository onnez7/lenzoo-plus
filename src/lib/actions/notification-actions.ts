'use server'

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function markNotificationsAsRead() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return;

        const userId = parseInt(session.user.id);
        const whereClause = session.user.role === 'LAB_USER'
            ? { labUserId: userId }
            : { userId: userId };
            
        await prisma.notification.updateMany({
            where: { ...whereClause, isRead: false },
            data: { isRead: true },
        });
    } catch (error) {
        console.error("Erro ao marcar notificações como lidas:", error);
    }
}