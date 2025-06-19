'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserRole, WhatsAppProvider } from '@prisma/client';
import Twilio from 'twilio';
import TestEmail from '@/emails/test-email';
import { sendEmail } from '@/lib/mail';

const formSchema = z.object({
    whatsAppProvider: z.nativeEnum(WhatsAppProvider).optional(),
    whatsAppApiToken: z.string().optional(),
    whatsAppInstanceId: z.string().optional(),
    whatsAppApiSecret: z.string().optional(),
    whatsAppFromNumber: z.string().optional(),
    whatsAppClientToken: z.string().optional(),
    emailApiKey: z.string().optional(),
    emailFromAddress: z.string().optional(),
});

export async function saveIntegrationSettings(values: z.infer<typeof formSchema>) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== UserRole.FRANCHISE_ADMIN || !session.user.franchiseId) {
            throw new Error("Acesso não autorizado ou franquia não encontrada.");
        }
        
        const franchiseId = parseInt(session.user.franchiseId as string);
        const validatedFields = formSchema.safeParse(values);
        if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

        const dataToUpdate = { ...validatedFields.data };

        // Lógica para limpar os campos não utilizados
        if (dataToUpdate.whatsAppProvider === 'TWILIO') {
            dataToUpdate.whatsAppInstanceId = null;
            dataToUpdate.whatsAppClientToken = null;
        } else if (dataToUpdate.whatsAppProvider === 'ZAPI') {
            dataToUpdate.whatsAppApiSecret = null;
            dataToUpdate.whatsAppFromNumber = null;
        } else {
            Object.keys(dataToUpdate).forEach(key => {
                if (key.startsWith('whatsApp')) (dataToUpdate as any)[key] = null;
            });
        }

        const updatedFranchise = await prisma.franchise.update({
            where: { id: franchiseId },
            data: dataToUpdate,
        });

        revalidatePath('/franchise/configuracoes');
        return { 
            success: true, 
            emailFromAddress: updatedFranchise.emailFromAddress // Retorna o email salvo
        };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível guardar." };
    }
}

// Função para testar a integração do WhatsApp (mantida sem alterações)
export async function testWhatsAppIntegration(phoneNumber: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== UserRole.FRANCHISE_ADMIN || !session.user.franchiseId) {
            throw new Error("Não autorizado ou franquia não encontrada.");
        }
        
        const franchiseId = parseInt(session.user.franchiseId, 10);
        const franchise = await prisma.franchise.findUnique({ where: { id: franchiseId } });

        if (!franchise || !franchise.whatsAppProvider) {
            return { success: false, message: "Nenhum provedor de WhatsApp configurado." };
        }

        const testMessage = "Olá! Esta é uma mensagem de teste da sua plataforma Lenzoo+.";

        if (franchise.whatsAppProvider === WhatsAppProvider.ZAPI) {
            const instanceId = franchise.whatsAppInstanceId;
            const token = franchise.whatsAppApiToken;
            const clientToken = franchise.whatsAppClientToken;

            if (!instanceId || !token || !clientToken) {
                return { success: false, message: "Credenciais da Z-API incompletas. Verifique todos os campos." };
            }

            const response = await fetch(`https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Client-Token': clientToken,
                },
                body: JSON.stringify({ phone: `55${phoneNumber.replace(/\D/g, '')}`, message: testMessage }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na Z-API: ${errorData.error || response.statusText}`);
            }
            
            return { success: true, message: `Mensagem de teste enviada para ${phoneNumber} via Z-API!` };
        } 
        else if (franchise.whatsAppProvider === WhatsAppProvider.TWILIO) {
            const accountSid = franchise.whatsAppApiSecret;
            const authToken = franchise.whatsAppApiToken;
            const fromNumber = franchise.whatsAppFromNumber;

            if (!accountSid || !authToken || !fromNumber) {
                return { success: false, message: "Credenciais da Twilio incompletas." };
            }
            
            const client = Twilio(accountSid, authToken);
            await client.messages.create({
                body: testMessage,
                from: fromNumber,
                to: `whatsapp:+55${phoneNumber.replace(/\D/g, '')}`
            });
            
            return { success: true, message: `Mensagem de teste enviada para ${phoneNumber} via Twilio com sucesso!` };
        }
        
        return { success: false, message: "Provedor desconhecido." };

    } catch (error: any) {
        console.error("[TEST_WHATSAPP_ERROR]", error);
        return { success: false, message: `Falha na API: ${error.message}` };
    }
}

// Função para testar a integração de email (já corrigida anteriormente)
export async function testEmailIntegration() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) throw new Error("Utilizador não tem um email para receber o teste.");
        
        const franchiseId = parseInt(session.user.franchiseId as string);
        const franchise = await prisma.franchise.findUnique({ where: { id: franchiseId } });

        if (!franchise || !franchise.emailApiKey || !franchise.emailFromAddress) {
            return { success: false, message: "Configuração de Email incompleta. Verifique a sua chave de API e endereço de envio." };
        }
        
        await sendEmail({
            apiKey: franchise.emailApiKey,
            from: franchise.emailFromAddress,
            to: session.user.email,
            subject: "Email de Teste - Lenzoo+",
            react: TestEmail({ userName: session.user.name || "Utilizador" }),
        });

        return { 
            success: true, 
            message: `Email de teste enviado para ${session.user.email} com sucesso!`, 
            emailFromAddress: franchise.emailFromAddress
        };

    } catch (error: any) {
        console.error("[TEST_EMAIL_ERROR]", error);
        return { success: false, message: `Falha no envio do email: ${error.message}` };
    }
}