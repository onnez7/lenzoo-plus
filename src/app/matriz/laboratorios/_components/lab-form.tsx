'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTransition } from 'react';
import { createLab, updateLab } from '../actions';
import { useRouter } from 'next/navigation';
import { Lab } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3, "O nome do laboratório é obrigatório."),
  email: z.string().email("Formato de e-mail inválido.").optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function LabForm({ lab }: { lab?: Lab }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isEditing = !!lab;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: lab?.name || "",
            email: lab?.email || "",
            phone: lab?.phone || "",
            address: lab?.address || "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateLab.bind(null, lab.id) : createLab;
            const result = await action(values);
            if (result.success) router.push('/matriz/laboratorios');
            else alert(result.error);
        });
    }

    return (
        <div className='bg-white p-8 rounded-lg shadow-sm max-w-2xl'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField name="name" render={({ field }) => (<FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="phone" render={({ field }) => (<FormItem><FormLabel>Telefone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField name="address" render={({ field }) => (<FormItem><FormLabel>Endereço</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <div className='flex justify-end gap-4 pt-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "A guardar..." : "Guardar"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}