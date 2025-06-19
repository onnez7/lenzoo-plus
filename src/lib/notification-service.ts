import { prisma } from "./prisma";
import { sendWhatsAppMessage } from "./whatsapp";
import { AutomationTrigger, Order, Client } from "@prisma/client";

type OrderWithDetails = Order & { client: Client };

export async function triggerAutomation(
  trigger: AutomationTrigger, 
  order: OrderWithDetails
) {
  try {
    const franchiseConfig = await prisma.franchise.findUnique({
      where: { id: order.franchiseId },
      select: {
        whatsAppProvider: true,
        whatsAppApiToken: true,
        whatsAppInstanceId: true,
        whatsAppApiSecret: true,
        whatsAppFromNumber: true,
        automations: {
          where: { trigger: trigger, 
            isActive: true }
        }
      }
    });

    const automation = franchiseConfig?.automations[0];

    if (!automation || !franchiseConfig?.whatsAppProvider) {
      return;
    }
     // Lógica para decidir o canal de envio (WhatsApp, Email, etc.)
    if (franchiseConfig.whatsAppProvider) {
        await sendWhatsAppMessage(franchiseConfig, order.client, order, automation);
    } 
    // else if (franchiseConfig.emailProvider) {
    //    await sendEmail(...);
    // }

    await sendWhatsAppMessage(franchiseConfig, order.client, order, automation);

  } catch (error) {
    console.error(`[AUTOMATION_ERROR] Falha ao processar o gatilho ${trigger} para o pedido ${order.id}`, error);
  }
}