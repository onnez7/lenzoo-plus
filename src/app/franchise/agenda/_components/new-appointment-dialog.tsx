'use client'

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, User } from "@prisma/client";
import { useTransition } from "react";
import { createAppointment } from "../actions";

const formSchema = z.object({
  clientId: z.string().min(1, "Selecione um cliente."),
  userId: z.string().min(1, "Selecione um profissional."),
  date: z.string().min(1, "Selecione uma data."),
  time: z.string().min(1, "Selecione um horário."),
  title: z.string().min(3, "A descrição é obrigatória."),
});

interface NewAppointmentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    clients: Client[];
    employees: User[];
}

export default function NewAppointmentDialog({ isOpen, setIsOpen, clients, employees }: NewAppointmentDialogProps) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });
    
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            const result = await createAppointment(values);
            if (result.success) {
                setIsOpen(false);
                form.reset();
            } else {
                alert(result.error);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle><DialogDescription>Preencha os dados para criar uma nova consulta.</DialogDescription></DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="clientId" render={({ field }) => (
                           <FormItem><FormLabel>Cliente</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                        )}/>
                        <FormField control={form.control} name="userId" render={({ field }) => (
                           <FormItem><FormLabel>Profissional</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl><SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>
                        )}/>
                         <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Ex: Consulta de Refração" {...field} /></FormControl><FormMessage /></FormItem>
                         )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="date" render={({ field }) => (
                               <FormItem><FormLabel>Data</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                            <FormField control={form.control} name="time" render={({ field }) => (
                               <FormItem><FormLabel>Horário</FormLabel><FormControl><Input type="time" step="3600" {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                        </div>
                        <DialogFooter><Button type="submit" disabled={isPending}>{isPending ? "A agendar..." : "Agendar"}</Button></DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}