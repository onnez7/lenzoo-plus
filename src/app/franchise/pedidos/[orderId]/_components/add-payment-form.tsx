'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@prisma/client";
import { addPaymentToOrder } from "../../actions";
import { useTransition } from "react";

const formSchema = z.object({
    amount: z.coerce.number().positive("O valor deve ser maior que zero."),
    method: z.nativeEnum(PaymentMethod),
});

interface AddPaymentFormProps {
    orderId: number;
    maxValue: number;
}

export default function AddPaymentForm({ orderId, maxValue }: AddPaymentFormProps) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: maxValue,
            method: PaymentMethod.DINHEIRO
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await addPaymentToOrder(orderId, values);
            if (!result.success) {
                alert(result.error);
            }
            form.reset({ amount: 0, method: values.method });
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                    <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" step="0.01" max={maxValue} {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="method" render={({ field }) => (
                    <FormItem><FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                        <SelectContent>{Object.values(PaymentMethod).map(m => (<SelectItem key={m} value={m}>{m.replace("_", " ")}</SelectItem>))}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "A registar..." : "Adicionar Pagamento"}
                </Button>
            </form>
        </Form>
    )
}