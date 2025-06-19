/*
 * =================================================================
 * FICHEIRO 3: FORMULÁRIO DE PEDIDO (ATUALIZADO PARA SER REUTILIZÁVEL)
 * Localização: src/app/(franchise)/pedidos/novo/_components/new-order-form.tsx
 * =================================================================
 * O formulário agora aceita um 'order' opcional para preencher
 * os campos e decidir se deve criar ou atualizar um pedido.
 */
'use client'

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Client, Product, Status, Order, OrderItem } from '@prisma/client';
import { Trash, PlusCircle } from 'lucide-react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, updateOrder } from '../actions'; // Importamos ambas as actions
import { Textarea } from '@/components/ui/textarea';

const orderItemSchema = z.object({
    productId: z.string().min(1, "Selecione um produto."),
    quantity: z.coerce.number().min(1),
    unitPrice: z.coerce.number(),
    description: z.string(),
});

const formSchema = z.object({
    clientId: z.string().min(1, "É necessário selecionar um cliente."),
    status: z.nativeEnum(Status),
    notes: z.string().optional(),
    items: z.array(orderItemSchema).min(1, "Adicione pelo menos um item ao pedido."),
});

type NewOrderFormValues = z.infer<typeof formSchema>;

// O tipo do pedido que recebemos inclui os itens
type OrderWithItems = Order & { items: OrderItem[] };

interface NewOrderFormProps {
    clients: Client[];
    products: Product[];
    order?: OrderWithItems; // A propriedade 'order' agora é opcional
}

export function NewOrderForm({ clients, products, order }: NewOrderFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<NewOrderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            clientId: order?.clientId.toString() || "",
            status: order?.status || Status.DRAFT,
            notes: order?.notes || "",
            // Mapeia os itens do pedido existente para o formato do formulário
            items: order?.items.map(item => ({
                productId: item.productId?.toString() || "",
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice),
                description: item.description,
            })) || [],
        },
    });

    const { fields, append, remove, update } = useFieldArray({ control: form.control, name: "items" });
    const totalAmount = form.watch('items').reduce((total, item) => total + (item.quantity * item.unitPrice), 0);

    const handleAddProduct = () => append({ productId: "", quantity: 1, unitPrice: 0, description: "" });
    const handleProductChange = (value: string, index: number) => {
        const selectedProduct = products.find(p => p.id === parseInt(value));
        if (selectedProduct) {
            update(index, {
                ...form.getValues(`items.${index}`),
                productId: selectedProduct.id.toString(),
                unitPrice: Number(selectedProduct.salePrice) || 0,
                description: selectedProduct.name,
            });
        }
    };
    
    function onSubmit(values: NewOrderFormValues) {
        startTransition(async () => {
            const action = order ? updateOrder.bind(null, order.id, { ...values, totalAmount }) : createOrder.bind(null, { ...values, totalAmount });
            const result = await action();
            
            if (result.success) {
                router.push('/franchise/pedidos');
            } else {
                alert(result.error);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-sm space-y-6">
                    {/* Seleção de Cliente */}
                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cliente</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {/* Itens do Pedido */}
                    <div>
                        <FormLabel>Itens do Pedido</FormLabel>
                        <div className="space-y-4 mt-2 border p-4 rounded-md">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.productId`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <Select onValueChange={(value) => { field.onChange(value); handleProductChange(value, index); }} defaultValue={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione um produto..." /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {products.map(product => (
                                                            <SelectItem key={product.id} value={product.id.toString()}>{product.name} - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(product.salePrice))}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input type="number" placeholder="Qtd." className="w-20" {...field} /></FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={handleAddProduct}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Adicionar Item
                            </Button>
                        </div>
                    </div>

                    {/* Total e outras informações */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status do Pedido</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {Object.values(Status).filter(s => s !== 'ACTIVE' && s !== 'INACTIVE').map(status => (
                                                <SelectItem key={status} value={status}>{status}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="text-right space-y-1">
                             <FormLabel>Valor Total</FormLabel>
                             <p className="text-2xl font-bold">
                                 {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalAmount)}
                             </p>
                         </div>
                     </div>
                     <FormField
                         control={form.control}
                         name="notes"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Observações</FormLabel>
                                 <FormControl>
                                     <Textarea placeholder="Adicione observações sobre o pedido, medidas, etc." {...field} />
                                 </FormControl>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />
                </div>

                <div className='flex justify-end gap-4 pt-4'>
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "A criar pedido..." : "Criar Pedido"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}