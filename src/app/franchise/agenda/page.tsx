import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { startOfWeek, endOfWeek } from "date-fns";
import { AgendaClient } from "./_components/agenda-client";

export default async function AgendaPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;
    if (!franchiseId) redirect("/login");

    // Busca dados da semana atual para a agenda
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Semana começa na Segunda
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const appointments = await prisma.appointment.findMany({
        where: {
            franchiseId,
            startDateTime: { gte: weekStart, lte: weekEnd },
        },
        include: { client: true, user: true },
        orderBy: { startDateTime: 'asc' }
    });

    // Busca clientes e colaboradores para o formulário de novo agendamento
    const clients = await prisma.client.findMany({ where: { franchiseId }, orderBy: { name: 'asc' } });
    const employees = await prisma.user.findMany({ where: { franchiseId }, orderBy: { name: 'asc' } });

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Agenda de Consultas</h1>
                <p className="text-muted-foreground">Visualize e gira os agendamentos da sua loja.</p>
            </div>
            {/* O componente cliente lida com toda a interatividade da agenda */}
            <AgendaClient 
                initialAppointments={appointments} 
                clients={clients} 
                employees={employees} 
            />
        </div>
    );
}