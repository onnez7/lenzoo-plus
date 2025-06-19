'use client'

import { ColumnDef } from "@tanstack/react-table"
import { LostSale, User } from "@prisma/client"
import { Badge } from "@/components/ui/badge";

type LostSaleWithUser = LostSale & { user: { name: string | null } };

export const columns: ColumnDef<LostSaleWithUser>[] = [
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => {
        const reason = row.original.reason.replace("_", " ");
        return <Badge variant="destructive">{reason}</Badge>
    }
  },
  {
    accessorKey: "notes",
    header: "Observações",
    cell: ({ row }) => <p className="text-sm text-muted-foreground truncate max-w-xs">{row.original.notes}</p>
  },
  {
    accessorKey: "user.name",
    header: "Registado por",
  },
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('pt-BR'),
  },
]