'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Order, Client, Status } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export type OrderWithClient = Order & { client: Client };

const statusMap: Record<Status, { label: string; className: string }> = {
    DRAFT: { label: 'Rascunho', className: 'bg-gray-200 text-gray-800' },
    PENDING: { label: 'Aguardando Pgto.', className: 'bg-yellow-100 text-yellow-800' },
    COMPLETED: { label: 'Finalizado', className: 'bg-green-100 text-green-800' },
    SHIPPED: { label: 'Enviado', className: 'bg-blue-100 text-blue-800' },
    CANCELLED: { label: 'Cancelado', className: 'bg-red-100 text-red-800' },
    ACTIVE: { label: 'Ativo', className: '' }, INACTIVE: { label: 'Inativo', className: '' },
};

export const columns: ColumnDef<OrderWithClient>[] = [
  { accessorKey: "id", header: "OS #", cell: ({ row }) => <div className="font-mono">#{row.getValue("id")}</div> },
  { accessorKey: "client.name", header: "Cliente" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as Status;
        const { label, className } = statusMap[status] || { label: status, className: '' };
        return <Badge className={className}>{label}</Badge>
    }
  },
  {
    accessorKey: "totalAmount",
    header: "Valor Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("totalAmount"));
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString('pt-BR')
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              {/* --- LINK CORRIGIDO AQUI --- */}
              <Link href={`/franchise/pedidos/${order.id}`}>
                <DropdownMenuItem>Ver detalhes da OS</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];