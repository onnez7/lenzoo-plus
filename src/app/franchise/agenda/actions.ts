'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const formSchema = z.object({
  clientId: z.string(), userId: z.string(),
  date: z.string(), time: z.string(),
  title: z.string(),
});

export async function createAppointment(values: z.infer<typeof formSchema>) {
    try {
        const session = await getServerSession(authOptions);
        const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
        if (!franchiseId) throw new Error("Não autorizado.");
        
        const { date, time, ...data } = values;
        const [hour, minute] = time.split(':');
        const startDateTime = new Date(date);
        startDateTime.setHours(parseInt(hour), parseInt(minute));

        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(startDateTime.getHours() + 1); // Consulta dura 1 hora

        await prisma.appointment.create({
            data: {
                ...data,
                startDateTime,
                endDateTime,
                clientId: parseInt(values.clientId),
                userId: parseInt(values.userId),
                franchiseId,
            }
        });

        revalidatePath('/franchise/agenda');
        return { success: true };

    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Não foi possível criar o agendamento." };
    }
}