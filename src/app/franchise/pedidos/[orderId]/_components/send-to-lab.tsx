'use client'

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lab } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { sendOrderToLab } from "../../actions";
import { Send } from "lucide-react";

const formSchema = z.object({
  labId: z.string().min(1, "É obrigatório selecionar um laboratório."),
});

interface SendToLabProps {
    orderId: number;
    labs: Lab[];
}

export function SendToLab({ orderId, labs }: SendToLabProps) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            const result = await sendOrderToLab(orderId, parseInt(values.labId));
            if (!result.success) {
                alert(result.error);
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="labId" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Escolha um laboratório</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {labs.map(lab => (
                                    <SelectItem key={lab.id} value={lab.id.toString()}>{lab.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}/>
                <Button type="submit" className="w-full" disabled={isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {isPending ? "A enviar..." : "Enviar para Laboratório"}
                </Button>
            </form>
        </Form>
    )
}