'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useTransition } from 'react';
import { createGlobalProduct, updateGlobalProduct } from '../actions';
import { useRouter } from 'next/navigation';
import { Product, ProductCategory } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3), sku: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  costPrice: z.coerce.number().optional(),
  salePrice: z.coerce.number().min(0),
  description: z.string().optional(),
});

export default function ProductForm({ product }: { product?: Product }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isEditing = !!product;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "", sku: product?.sku || "",
            category: product?.category || undefined,
            costPrice: product?.costPrice ? Number(product.costPrice) : undefined,
            salePrice: product?.salePrice ? Number(product.salePrice) : 0,
            description: product?.description || "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = isEditing ? updateGlobalProduct.bind(null, product.id) : createGlobalProduct;
            const result = await action(values);
            if (result.success) router.push('/matriz/produtos');
            else alert(result.error);
        });
    }

    return (
        <div className='bg-white p-8 rounded-lg shadow-sm max-w-2xl'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField name="name" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Nome do Produto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="sku" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>SKU / Código</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="category" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                <SelectContent>{Object.values(ProductCategory).map(cat => ( <SelectItem key={cat} value={cat}>{cat}</SelectItem> ))}</SelectContent>
                            </Select><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField name="costPrice" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Preço de Custo (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="salePrice" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Preço Sugerido de Venda (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <FormField name="description" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className='flex justify-end gap-4 pt-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "A guardar..." : "Guardar Produto"}</Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}