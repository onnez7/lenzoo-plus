'use server'

import { prisma } from "@/lib/prisma";
import { AutomationTrigger, Status } from "@prisma/client";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { triggerAutomation } from "@/lib/notification-service";

export async function processDaysAfterPurchaseAutomations() {
    try {
        console.log("A iniciar o processamento de automações 'DAYS_AFTER_PURCHASE'...");

        // 1. Encontra todas as automações ativas deste tipo
        const automations = await prisma.automation.findMany({
            where: {
                trigger: AutomationTrigger.DAYS_AFTER_PURCHASE,
                isActive: true,
                delayInDays: { not: null, gt: 0 } // Garante que temos um atraso válido
            }
        });

        if (automations.length === 0) {
            return { success: true, message: "Nenhuma automação de 'dias após a compra' ativa encontrada." };
        }

        let messagesSent = 0;

        // 2. Itera sobre cada regra de automação encontrada
        for (const automation of automations) {
            const delay = automation.delayInDays!;
            
            // 3. Calcula a data alvo (hoje - o atraso)
            const targetDate = subDays(new Date(), delay);
            const targetDateStart = startOfDay(targetDate);
            const targetDateEnd = endOfDay(targetDate);

            // 4. Encontra todos os pedidos que foram finalizados na data alvo
            const targetOrders = await prisma.order.findMany({
                where: {
                    franchiseId: automation.franchiseId,
                    status: Status.COMPLETED,
                    updatedAt: { // Usamos updatedAt, pois é quando o status muda para COMPLETED
                        gte: targetDateStart,
                        lte: targetDateEnd,
                    }
                },
                include: { client: true }
            });

            // 5. Dispara a mensagem para cada pedido encontrado
            for (const order of targetOrders) {
                console.log(`A processar pedido #${order.id} para o cliente ${order.client.name}`);
                await triggerAutomation(AutomationTrigger.DAYS_AFTER_PURCHASE, order);
                messagesSent++;
            }
        }
        
        return { success: true, message: `${messagesSent} mensagens foram processadas e enviadas.` };

    } catch (error) {
        console.error("[PROCESS_AUTOMATIONS_ERROR]", error);
        return { success: false, error: "Ocorreu um erro ao processar as automações." };
    }
}