'use client'

import { useState, useTransition } from "react";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Expense, ExpenseCategory } from '@prisma/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { createExpense, updateExpense } from '../actions';

const formSchema = z.object({
  description: z.string().min(3, "A descrição é obrigatória."),
  amount: z.coerce.number().positive("O valor deve ser positivo."),
  category: z.nativeEnum(ExpenseCategory),
  dueDate: z.date().optional(),
  isPaid: z.boolean(),
});

interface ExpenseDialogProps {
    expense?: Expense;
    children: React.ReactNode; // O botão que vai abrir o diálogo
}

export function ExpenseDialog({ expense, children }: ExpenseDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);
    const isEditing = !!expense;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: expense?.description || "",
            amount: expense ? Number(expense.amount) : 0,
            category: expense?.category || undefined,
            dueDate: expense?.dueDate || undefined,
            isPaid: !!expense?.paidAt,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateExpense.bind(null, expense.id) : createExpense;
            const result = await action(values);
            if (result.success) {
                setIsOpen(false);
            } else {
                alert(result.error);
            }
        });
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
                    <DialogDescription>{isEditing ? "Atualize os dados da despesa." : "Registe uma nova despesa."}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField name="description" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="amount" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="category" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..."/></SelectTrigger></FormControl>
                                <SelectContent>{Object.values(ExpenseCategory).map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                        <FormField name="dueDate" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-col"><FormLabel>Vencimento</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                            </PopoverContent></Popover><FormMessage /></FormItem>
                        )}/>
                        <FormField name="isPaid" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel>Marcar como Paga</FormLabel>
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={isPending}>{isPending ? "A guardar..." : "Guardar"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}