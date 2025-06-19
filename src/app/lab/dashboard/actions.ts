'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Status, AutomationTrigger } from "@prisma/client";
import { triggerAutomation } from "@/lib/notification-service"; // Importamos o nosso serviço de notificações

export async function updateOrderStatus(orderId: number, newStatus: Status) {
    try {
        const session = await getServerSession(authOptions);
        const labId = session?.user?.labId ? parseInt(session.user.labId) : null;

        if (!labId || session.user.role !== 'LAB_USER') {
            throw new Error("Não autorizado.");
        }

        // Validação: Garante que o laboratório só pode atualizar um pedido que lhe pertence
        const orderToUpdate = await prisma.order.findFirst({
            where: { id: orderId, labId: labId },
        });

        if (!orderToUpdate) {
            throw new Error("Ordem de Serviço não encontrada ou não pertence a este laboratório.");
        }
        
        // Guarda o estado antigo para comparação
        const oldStatus = orderToUpdate.status;

        // Atualiza o pedido
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus },
            include: { client: true } // Inclui o cliente para a notificação
        });

        // --- LÓGICA DO GATILHO AQUI ---
        // Se o estado do pedido mudou e o novo estado é 'COMPLETED',
        // dispara a automação correspondente.
        if (newStatus !== oldStatus && newStatus === Status.COMPLETED) {
            console.log(`[AUTOMATION_TRIGGER] Pedido #${updatedOrder.id} finalizado. A verificar automações...`);
            await triggerAutomation(AutomationTrigger.ORDER_COMPLETED, updatedOrder);
        }

        // Revalida o cache para que ambos os painéis (lab e franchise) vejam a mudança
        revalidatePath('/lab/dashboard');
        revalidatePath(`/franchise/pedidos/${orderId}`);

        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível atualizar o status." };
    }
}