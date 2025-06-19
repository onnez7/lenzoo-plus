/*
 * =================================================================
 * FICHEIRO 2: AS COLUNAS DA TABELA (ATUALIZADO)
 * Localização: src/app/(franchise)/clientes/_components/columns.tsx
 * =================================================================
 * Atualizei este ficheiro para que os links de "Editar" e "Ver detalhes"
 * agora apontem para a página de edição de cada cliente.
 */
'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Client } from "@prisma/client";
import Link from "next/link"; // Importar Link

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Telefone",
  },
    {
    accessorKey: "cpf",
    header: "CPF",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;
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
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(client.id.toString())}>
                 Copiar ID do Cliente
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* Link para a página de edição */}
                <Link href={`/clientes/${client.id}`}>
                    <DropdownMenuItem>
                        Ver/Editar detalhes
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];
