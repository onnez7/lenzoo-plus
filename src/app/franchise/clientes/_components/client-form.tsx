/*
 * =================================================================
 * FICHEIRO 5: O FORMULÁRIO REUTILIZÁVEL DE CLIENTE (ATUALIZADO)
 * Localização: src/app/(franchise)/clientes/_components/client-form.tsx
 * =================================================================
 * Atualizei este formulário para aceitar dados iniciais (para edição)
 * e para chamar a função de 'update' quando necessário.
 */
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTransition } from 'react';
import { createClient, updateClient } from '../actions'; // Importamos ambas as actions
import { useRouter } from 'next/navigation';
import { Client } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  cpf: z.string().optional(),
});

// O formulário agora aceita um 'client' como propriedade opcional
interface ClientFormProps {
    client?: Client;
}

export default function ClientForm({ client }: ClientFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        // Se um cliente for passado, usamos os seus dados como valores padrão
        defaultValues: {
            name: client?.name || "",
            email: client?.email || "",
            phone: client?.phone || "",
            cpf: client?.cpf || "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            // Se estivermos a editar (client existe), chamamos 'updateClient'
            if (client) {
                const result = await updateClient(client.id, values);
                if (result.success) {
                    router.push('/franchise/clientes');
                } else {
                    console.error(result.error);
                    alert(result.error);
                }
            } else { // Caso contrário, chamamos 'createClient'
                const result = await createClient(values);
                if (result.success) {
                    router.push('/franchise/clientes');
                } else {
                    console.error(result.error);
                    alert(result.error);
                }
            }
        });
    }

    return (
        <div className='bg-white p-8 rounded-lg shadow-sm max-w-2xl'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                     <FormField control={form.control} name="email" render={({ field }) => (
                         <FormItem>
                             <FormLabel>Email</FormLabel>
                             <FormControl>
                                 <Input placeholder="john.doe@example.com" {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                     )}/>
                     <FormField control={form.control} name="phone" render={({ field }) => (
                         <FormItem>
                             <FormLabel>Telefone</FormLabel>
                             <FormControl>
                                 <Input placeholder="(11) 99999-9999" {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                     )}/>
                     <FormField control={form.control} name="cpf" render={({ field }) => (
                         <FormItem>
                             <FormLabel>CPF</FormLabel>
                             <FormControl>
                                 <Input placeholder="123.456.789-00" {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                     )}/>
                    <div className='flex justify-end gap-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "A guardar..." : "Guardar Cliente"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
