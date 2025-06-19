import { prisma } from "./prisma";
import { Automation, Client, Order, Franchise, WhatsAppProvider } from "@prisma/client";
import Twilio from 'twilio';

type WhatsAppCredentials = Pick<Franchise, "whatsAppProvider" | "whatsAppApiToken" | "whatsAppInstanceId" | "whatsAppApiSecret" | "whatsAppFromNumber">;

export async function sendWhatsAppMessage(
  credentials: WhatsAppCredentials,
  client: Client, 
  order: Order, 
  automation: Automation
) {
  if (!client.phone) {
    console.warn(`[WHATSAPP] Cliente ${client.name} (ID: ${client.id}) não tem telefone.`);
    return;
  }
  
  let messageBody = automation.message.replace(/{{cliente}}/g, client.name.split(" ")[0]);
  const recipientNumber = client.phone.replace(/\D/g, '');
  const to = `55${recipientNumber}`;

  let success = false;
  let errorMessage = "Provedor não configurado ou inválido.";

  try {
    if (credentials.whatsAppProvider === WhatsAppProvider.TWILIO) {
      const { whatsAppApiSecret: accountSid, whatsAppApiToken: authToken, whatsAppFromNumber: fromNumber } = credentials;
      if (!accountSid || !authToken || !fromNumber) throw new Error("Credenciais da Twilio incompletas.");
      
      const twilioClient = Twilio(accountSid, authToken);
      await twilioClient.messages.create({
          body: messageBody,
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:${to}`,
      });
      success = true;

    } else if (credentials.whatsAppProvider === WhatsAppProvider.ZAPI) {
      const { whatsAppInstanceId: instanceId, whatsAppApiToken: token } = credentials;
      if (!instanceId || !token) throw new Error("Credenciais da Z-API incompletas.");

      const response = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: to, message: messageBody }),
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Erro na Z-API: ${errorData.error || response.statusText}`);
      }
      success = true;
    }
  } catch (error: any) {
      errorMessage = error.message;
      console.error(`[WHATSAPP_SEND_ERROR] via ${credentials.whatsAppProvider}:`, error);
  }

  // Regista o log do envio (ou da falha)
  await prisma.messageLog.create({
    data: {
      recipient: client.phone,
      message: messageBody,
      status: success ? "SENT" : "FAILED",
      automationId: automation.id,
      clientId: client.id,
      orderId: order.id,
    }
  });

  if (!success) {
      // Opcional: Lançar um erro aqui se quiser que a 'action' que chamou saiba da falha.
      // throw new Error(errorMessage);
  }
}