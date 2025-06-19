/*
 * =================================================================
 * FICHEIRO 5: O FORMULÁRIO REUTILIZÁVEL DE PRODUTO
 * Localização: src/app/(franchise)/produtos/_components/product-form.tsx
 * =================================================================
 */
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
import { createProduct, updateProduct } from '../actions';
import { useRouter } from 'next/navigation';
import { Product, ProductCategory } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  sku: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  salePrice: z.coerce.number().min(0, { message: "O preço deve ser positivo." }),
  description: z.string().optional(),
});

interface ProductFormProps {
    product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name || "",
            sku: product?.sku || "",
            category: product?.category || undefined,
            salePrice: product?.salePrice ? Number(product.salePrice) : 0,
            description: product?.description || "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const action = product ? updateProduct.bind(null, product.id) : createProduct;
            const result = await action(values);
            if (result.success) {
                router.push('/franchise/produtos');
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
                        <FormItem>
                            <FormLabel>Nome do Produto</FormLabel>
                            <FormControl><Input placeholder="Armação FlexColor" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="sku" render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU / Código</FormLabel>
                                <FormControl><Input placeholder="AFC-001" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="salePrice" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço de Venda (R$)</FormLabel>
                                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>

                    <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoria</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {Object.values(ProductCategory).map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl><Textarea placeholder="Descreva o produto..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>

                    <div className='flex justify-end gap-4 pt-4'>
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "A guardar..." : "Guardar Produto"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}