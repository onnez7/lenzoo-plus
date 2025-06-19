'use client'

import { useTransition } from "react";
import { Status } from "@prisma/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateOrderStatus } from "../actions";

interface StatusUpdaterProps {
    orderId: number;
    currentStatus: Status;
}

// Define os estados que o laboratório pode selecionar
const labSelectableStatus = [
    Status.IN_PRODUCTION,
    Status.LENS_ORDERED,
    Status.IN_ASSEMBLY,
    Status.QUALITY_CONTROL,
    Status.COMPLETED, // Quando o lab completa, a OS está pronta para a ótica
];

export function StatusUpdater({ orderId, currentStatus }: StatusUpdaterProps) {
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (newStatus: Status) => {
        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (!result.success) {
                alert(result.error);
            }
        });
    };

    return (
        <Select
            onValueChange={handleStatusChange}
            defaultValue={currentStatus}
            disabled={isPending}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Alterar status..." />
            </SelectTrigger>
            <SelectContent>
                {labSelectableStatus.map(status => (
                    <SelectItem key={status} value={status}>
                        {status.replace("_", " ")}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}