'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTransition } from 'react';
import { createUser, updateUser } from '../actions';
import { useRouter } from 'next/navigation';
import { User, Status } from '@prisma/client';

// Schema de validação para criar um novo utilizador
const createUserSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  status: z.nativeEnum(Status),
});

// Schema de validação para atualizar (senha é opcional)
const updateUserSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório."),
  email: z.string().email("Formato de e-mail inválido."),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres.").optional().or(z.literal('')),
  status: z.nativeEnum(Status),
});

interface UserFormProps {
    user?: User;
}

export default function UserForm({ user }: UserFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isEditing = !!user;

    // --- CORREÇÃO AQUI ---
    // Determinamos qual schema usar numa variável ANTES de a usarmos.
    const formSchema = isEditing ? updateUserSchema : createUserSchema;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            password: "",
            status: user?.status || Status.ACTIVE,
        },
    });

    // A função onSubmit agora usa o 'formSchema' que já foi definido.
    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateUser.bind(null, user.id) : createUser;
            const result = await action(values as any); 
            if (result.success) {
                router.push('/franchise/usuarios');
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
                        <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem><FormLabel>Senha</FormLabel><FormControl><Input type="password" {...field} /></FormControl>
                        {isEditing && <FormDescription>Deixe em branco para não alterar a senha.</FormDescription>}
                        <FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem><FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value={Status.ACTIVE}>Ativo</SelectItem>
                                <SelectItem value={Status.INACTIVE}>Inativo</SelectItem>
                            </SelectContent>
                        </Select><FormMessage /></FormItem>
                    )}/>
                    <div className='flex justify-end gap-4 pt-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "A guardar..." : "Guardar Colaborador"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}