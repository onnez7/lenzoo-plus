
'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Status, AutomationTrigger, PaymentMethod } from '@prisma/client';
import { triggerAutomation } from '@/lib/notification-service';


const orderItemSchema = z.object({
    productId: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    description: z.string(),
});

const formSchema = z.object({
  clientId: z.string(),
  status: z.nativeEnum(Status),
  notes: z.string().optional(),
  items: z.array(orderItemSchema),
  totalAmount: z.number(),
});

const paymentSchema = z.object({
    amount: z.number().positive(),
    method: z.nativeEnum(PaymentMethod),
});

type OrderInput = z.infer<typeof formSchema>;

// A função de CRIAR continua a mesma
export async function createOrder(values: OrderInput) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Não autorizado." };
    const franchiseId = session.user.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    const userId = parseInt(session.user.id, 10);
    if (!franchiseId) return { success: false, error: "Utilizador não está associado a uma franquia." };
    
    const validatedFields = formSchema.safeParse(values);
    if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

    const { clientId, items, ...orderData } = validatedFields.data;
    try {
        await prisma.order.create({
            data: { ...orderData, franchiseId, userId, clientId: parseInt(clientId),
                items: { create: items.map(item => ({ ...item, productId: parseInt(item.productId) })) },
            }
        });
        revalidatePath('/pedidos');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Ocorreu um erro no servidor ao criar o pedido." };
    }
}

// NOVA FUNÇÃO para ATUALIZAR um pedido
export async function updateOrder(orderId: number, values: OrderInput) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false, error: "Não autorizado." };
    
    // ... (validação e busca do pedido antigo)
    const orderToUpdate = await prisma.order.findUnique({ where: { id: orderId }, include: { client: true } });
    if (!orderToUpdate) return { success: false, error: "Pedido não encontrado." };
    
    const oldStatus = orderToUpdate.status;

    const { clientId, items, ...orderData } = values;

    try {
        const updatedOrder = await prisma.$transaction(async (tx) => {
            await tx.orderItem.deleteMany({ where: { orderId: orderId } });
            return await tx.order.update({
                where: { id: orderId },
                data: {
                    ...orderData,
                    clientId: parseInt(clientId),
                    items: {
                        create: items.map(item => ({ ...item, productId: parseInt(item.productId) })),
                    },
                },
                include: { client: true }
            });
        });

        // --- LÓGICA DO GATILHO AQUI ---
        // Se o estado do pedido mudou, verifica se há uma automação para disparar.
        if (updatedOrder.status !== oldStatus) {
            if (updatedOrder.status === Status.COMPLETED) {
                await triggerAutomation(AutomationTrigger.ORDER_COMPLETED, updatedOrder);
            }
            if (updatedOrder.status === Status.SHIPPED) {
                await triggerAutomation(AutomationTrigger.ORDER_SHIPPED, updatedOrder);
            }
        }

        revalidatePath('/franchise/pedidos');
        revalidatePath(`/franchise/pedidos/${orderId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: "Ocorreu um erro no servidor ao atualizar o pedido." };
    }
}

export async function addPaymentToOrder(orderId: number, values: z.infer<typeof paymentSchema>) {
    try {
        // Validações de segurança e permissão aqui...
        const validatedFields = paymentSchema.safeParse(values);
        if (!validatedFields.success) throw new Error("Dados de pagamento inválidos.");

        await prisma.payment.create({
            data: {
                orderId: orderId,
                amount: validatedFields.data.amount,
                method: validatedFields.data.method,
            }
        });

        // Limpa o cache para que a página de detalhes seja recarregada com os novos dados
        revalidatePath(`/franchise/pedidos/${orderId}`);
        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível adicionar o pagamento." };
    }
}

export async function sendOrderToLab(orderId: number, labId: number) {
    try {
        const session = await getServerSession(authOptions);
        const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
        if (!franchiseId) throw new Error("Não autorizado.");

        const order = await prisma.order.findFirst({
            where: { id: orderId, franchiseId: franchiseId }
        });
        if (!order) throw new Error("Ordem de Serviço não encontrada.");

        // Atualiza a OS
        await prisma.order.update({
            where: { id: orderId },
            data: { labId: labId, status: Status.IN_PRODUCTION }
        });

        // --- LÓGICA DE NOTIFICAÇÃO AQUI ---
        // 1. Encontra todos os utilizadores do laboratório selecionado
        const labUsers = await prisma.labUser.findMany({
            where: { labId: labId }
        });
        
        // 2. Cria uma notificação para cada utilizador do laboratório
        if (labUsers.length > 0) {
            const message = `Nova Ordem de Serviço #${orderId} recebida da Ótica ${session.user.name}.`;
            const link = `/lab/dashboard`; // Link direto para o dashboard do lab

            await prisma.notification.createMany({
                data: labUsers.map(labUser => ({
                    message: message,
                    link: link,
                    labUserId: labUser.id
                }))
            });
        }
        
        revalidatePath(`/franchise/pedidos/${orderId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível enviar para o laboratório." };
    }
}


