'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Order, Client, Payment } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Criamos um tipo para os dados da tabela, que inclui os campos calculados
export type OrderWithReceivables = Order & {
  client: Client
  payments: Payment[]
  totalPaid: number
  balanceDue: number
}

// Função para formatar valores monetários
const formatCurrency = (amount: number) => new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(amount);

export const columns: ColumnDef<OrderWithReceivables>[] = [
  {
    accessorKey: "id",
    header: "OS #",
    cell: ({ row }) => <div className="font-mono">#{row.original.id}</div>
  },
  {
    accessorKey: "client.name",
    header: "Cliente",
  },
  {
    accessorKey: "totalAmount",
    header: "Valor Total",
    cell: ({ row }) => formatCurrency(Number(row.original.totalAmount)),
  },
  {
    accessorKey: "totalPaid",
    header: "Valor Pago",
    cell: ({ row }) => formatCurrency(row.original.totalPaid),
  },
    {
    accessorKey: "balanceDue",
    header: "Saldo Devedor",
    cell: ({ row }) => <div className="font-bold text-red-600">{formatCurrency(row.original.balanceDue)}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <Link href={`/franchise/pedidos/${order.id}`}>
                <DropdownMenuItem>
                  Ver OS / Registar Pagamento
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]