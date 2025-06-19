'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useTransition } from 'react';
import { createAutomation, updateAutomation } from '../actions';
import { useRouter } from 'next/navigation';
import { Automation, AutomationTrigger } from '@prisma/client';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório."),
  trigger: z.nativeEnum(AutomationTrigger),
  delayInDays: z.coerce.number().min(0).optional(),
  message: z.string().min(10, "A mensagem é muito curta."),
  isActive: z.boolean(),
});

interface AutomationFormProps {
    automation?: Automation;
}

export function AutomationForm({ automation }: AutomationFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isEditing = !!automation;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: automation?.name || "",
            trigger: automation?.trigger || undefined,
            delayInDays: automation?.delayInDays || 0,
            message: automation?.message || "Olá {{cliente}}, obrigado pela sua compra!",
            isActive: automation?.isActive ?? true,
        },
    });
    
    const selectedTrigger = form.watch("trigger");

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateAutomation.bind(null, automation.id) : createAutomation;
            const result = await action(values);
            if (result.success) {
                router.push('/franchise/automacoes');
            } else {
                alert(result.error);
            }
        });
    }

    return (
        <div className='bg-white p-8 rounded-lg shadow-sm max-w-2xl'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField name="name" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome da Automação</FormLabel><FormControl><Input placeholder="Agradecimento Pós-Venda" {...field} /></FormControl><FormDescription>Um nome interno para si.</FormDescription><FormMessage /></FormItem>
                    )}/>
                    <FormField name="trigger" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Gatilho</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Quando esta mensagem deve ser enviada?"/></SelectTrigger></FormControl>
                            <SelectContent>{Object.values(AutomationTrigger).map(t => (<SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>))}</SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
                    {selectedTrigger === "DAYS_AFTER_PURCHASE" && (
                         <FormField name="delayInDays" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Atraso (em dias)</FormLabel><FormControl><Input type="number" placeholder="Ex: 7" {...field} /></FormControl><FormDescription>Enviar a mensagem X dias após a compra.</FormDescription><FormMessage /></FormItem>
                        )}/>
                    )}
                    <FormField name="message" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Modelo da Mensagem</FormLabel>
                        <FormControl><Textarea rows={5} placeholder="Escreva a sua mensagem aqui..." {...field} /></FormControl>
                        <FormDescription>Use <code className="font-mono bg-muted p-1 rounded-sm">{"{{cliente}}"}</code> para inserir o nome do cliente.</FormDescription>
                        <FormMessage /></FormItem>
                    )}/>
                    <FormField name="isActive" control={form.control} render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <FormLabel>Automação Ativa?</FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}/>
                    <div className='flex justify-end gap-4 pt-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "A guardar..." : "Guardar Automação"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}