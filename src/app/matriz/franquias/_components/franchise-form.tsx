'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTransition } from 'react';
import { createFranchise, updateFranchise } from '../actions';
import { useRouter } from 'next/navigation';
import { Franchise, SubscriptionPlan } from '@prisma/client';
import { Switch } from '@/components/ui/switch';

const formSchema = z.object({
  name: z.string().min(3, "O nome da franquia é obrigatório."),
  email: z.string().email("Formato de e-mail inválido."),
  phone: z.string().optional(),
  cnpj: z.string().optional(),
  subscriptionPlan: z.nativeEnum(SubscriptionPlan),
  isActive: z.boolean(),
});

interface FranchiseFormProps {
    franchise?: Franchise;
}

export default function FranchiseForm({ franchise }: FranchiseFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isEditing = !!franchise;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: franchise?.name || "",
            email: franchise?.email || "",
            phone: franchise?.phone || "",
            cnpj: franchise?.cnpj || "",
            subscriptionPlan: franchise?.subscriptionPlan || SubscriptionPlan.FREE,
            isActive: franchise?.isActive ?? true,
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateFranchise.bind(null, franchise.id) : createFranchise;
            const result = await action(values);
            if (result.success) {
                router.push('/matriz/franquias');
            } else {
                alert(result.error);
            }
        });
    }

    return (
        <div className='bg-white p-8 rounded-lg shadow-sm max-w-2xl'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Nome da Franquia</FormLabel><FormControl><Input placeholder="Lenzoo+ Centro" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email de Contato</FormLabel><FormControl><Input type="email" placeholder="contato@lenzoocentro.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                     <FormField control={form.control} name="cnpj" render={({ field }) => (
                        <FormItem><FormLabel>CNPJ</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <FormField control={form.control} name="subscriptionPlan" render={({ field }) => (
                            <FormItem><FormLabel>Plano de Assinatura</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Object.values(SubscriptionPlan).map(plan => (
                                        <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="isActive" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <FormLabel>Franquia Ativa?</FormLabel>
                                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}/>
                     </div>
                    <div className='flex justify-end gap-4 pt-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "A guardar..." : "Guardar Franquia"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}