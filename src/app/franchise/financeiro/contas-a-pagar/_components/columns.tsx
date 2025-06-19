'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Expense } from "@prisma/client"
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ExpenseDialog } from "./expense-dialog";

const formatCurrency = (amount: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);

export const columns: ColumnDef<Expense>[] = [
  { accessorKey: "description", header: "Descrição" },
  { accessorKey: "category", header: "Categoria", cell: ({ row }) => <Badge variant="outline">{row.original.category}</Badge> },
  { accessorKey: "amount", header: "Valor", cell: ({ row }) => formatCurrency(Number(row.original.amount)) },
  { accessorKey: "dueDate", header: "Vencimento", cell: ({ row }) => row.original.dueDate ? new Date(row.original.dueDate).toLocaleDateString('pt-BR') : 'N/A' },
  {
      accessorKey: "paidAt",
      header: "Status",
      cell: ({ row }) => row.original.paidAt 
        ? <Badge>Pago</Badge>
        : <Badge variant="destructive">Pendente</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
        const expense = row.original;
        return (
            <div className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        {/* O item de menu agora está dentro do componente de diálogo */}
                        <ExpenseDialog expense={expense}>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Editar / Marcar como Pago</DropdownMenuItem>
                        </ExpenseDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }
  }
]