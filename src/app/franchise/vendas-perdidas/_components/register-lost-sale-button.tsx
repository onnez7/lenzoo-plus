'use client'

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { LostSaleReason } from "@prisma/client";
import { registerLostSale } from "../actions";

const formSchema = z.object({
  reason: z.nativeEnum(LostSaleReason, { errorMap: () => ({ message: "Por favor, selecione um motivo." }) }),
  notes: z.string().optional(),
});

export function RegisterLostSaleButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            const result = await registerLostSale(values);
            if (result.success) {
                setIsOpen(false);
                form.reset();
            } else {
                alert(result.error);
            }
        });
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Registar Venda Perdida
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registar uma Venda Perdida</DialogTitle>
                        <DialogDescription>
                            Ajude-nos a entender o que aconteceu. Esta informação é muito valiosa.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="reason" render={({ field }) => (
                                <FormItem><FormLabel>Principal Motivo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione o motivo..." /></SelectTrigger></FormControl>
                                    <SelectContent>{Object.values(LostSaleReason).map(reason => (
                                        <SelectItem key={reason} value={reason}>{reason.replace("_", " ")}</SelectItem>
                                    ))}</SelectContent>
                                </Select><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem><FormLabel>Observações (Opcional)</FormLabel>
                                <FormControl><Textarea placeholder="Ex: O cliente procurava um modelo específico que não tínhamos..." {...field} /></FormControl>
                                <FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <Button type="submit" disabled={isPending}>
                                    {isPending ? "A registar..." : "Registar"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    )
}