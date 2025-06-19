'use client'

import * as React from "react"; // <-- CORREÇÃO AQUI
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Target } from "lucide-react"
import { setSalesGoal } from "../actions"
import { useTransition } from "react"

const formSchema = z.object({
  targetAmount: z.coerce.number().min(0, "A meta deve ser um valor positivo."),
});

interface GoalSetterProps {
    employeeId: number;
    currentGoal: number;
}

export default function GoalSetter({ employeeId, currentGoal }: GoalSetterProps) {
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            targetAmount: currentGoal || 0
        }
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const result = await setSalesGoal(employeeId, values.targetAmount);
            if (result.success) {
                setIsOpen(false);
            } else {
                alert(result.error);
            }
        });
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Definir Meta
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Meta Mensal</h4>
                                <p className="text-sm text-muted-foreground">Defina o valor da meta de vendas para este colaborador.</p>
                            </div>
                             <FormField control={form.control} name="targetAmount" render={({ field }) => (
                                <FormItem><FormLabel>Valor da Meta (R$)</FormLabel><FormControl><Input type="number" step="100" {...field} /></FormControl><FormMessage /></FormItem>
                             )}/>
                        </div>
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "A guardar..." : "Guardar Meta"}
                        </Button>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    )
}