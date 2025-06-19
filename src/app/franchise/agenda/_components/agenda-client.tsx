'use client'

import * as React from "react";
import { useState } from "react";
import { Appointment, Client, User } from "@prisma/client";
import { format, startOfWeek, addDays, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewAppointmentDialog from "./new-appointment-dialog";

type AppointmentWithDetails = Appointment & { client: Client; user: User };

interface AgendaClientProps {
    initialAppointments: AppointmentWithDetails[];
    clients: Client[];
    employees: User[];
}

export function AgendaClient({ initialAppointments, clients, employees }: AgendaClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });
    const timeSlots = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`); // 8:00 to 19:00

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Agendamento
                </Button>
            </div>

            <div className="grid grid-cols-8 flex-1 border-t border-l">
                <div className="border-r border-b p-2 font-semibold bg-muted/40">Hora</div>
                {weekDays.map(day => (
                    <div key={day.toString()} className="border-r border-b p-2 font-semibold text-center bg-muted/40">
                        <p>{format(day, 'EEE', { locale: ptBR })}</p>
                        <p className="text-2xl">{format(day, 'dd')}</p>
                    </div>
                ))}

                {timeSlots.map(time => (
                    <React.Fragment key={time}>
                        <div className="border-r border-b p-2 font-semibold text-center">{time}</div>
                        {weekDays.map(day => {
                            const appointmentsInSlot = initialAppointments.filter(app => {
                                const appDate = new Date(app.startDateTime);
                                return appDate.getDate() === day.getDate() && appDate.getHours() === parseInt(time);
                            });

                            return (
                                <div key={day.toString() + time} className="border-r border-b p-1 h-24 overflow-y-auto">
                                    {appointmentsInSlot.map(app => (
                                        <Card key={app.id} className="mb-1 bg-blue-50 text-blue-800 text-xs p-1">
                                            <p className="font-bold truncate">{app.client.name}</p>
                                            <p className="truncate">{app.user.name}</p>
                                        </Card>
                                    ))}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            <NewAppointmentDialog 
                isOpen={isDialogOpen} 
                setIsOpen={setIsDialogOpen}
                clients={clients}
                employees={employees}
            />
        </>
    );
}