'use client'

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useTransition } from "react"
import { updateProductAssignments } from "../../../actions" // <-- CAMINHO CORRIGIDO
import { useRouter } from "next/navigation"

const formSchema = z.object({
  assignments: z.array(z.object({
      franchiseId: z.number(),
      isAssigned: z.boolean(),
  }))
})
type AssignmentFormValues = z.infer<typeof formSchema>

interface AssignmentFormProps {
    productId: number
    franchises: { franchiseId: number; name: string; isAssigned: boolean }[]
}

export function AssignmentForm({ productId, franchises }: AssignmentFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { assignments: franchises }
    });

    function onSubmit(data: AssignmentFormValues) {
        startTransition(async () => {
            const result = await updateProductAssignments(productId, data.assignments);
            if (result.success) {
                router.push("/matriz/produtos");
            } else {
                alert(result.error);
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                 <div className="space-y-4">
                    {form.getValues('assignments').map((franchise, index) => (
                        <FormField
                            key={franchise.franchiseId}
                            control={form.control}
                            name={`assignments.${index}.isAssigned`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>{franchises[index].name}</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                    ))}
                </div>
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "A guardar..." : "Guardar Atribuições"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}