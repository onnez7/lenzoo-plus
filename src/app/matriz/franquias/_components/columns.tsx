'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Franchise } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Franchise>[] = [
  { accessorKey: "name", header: "Nome da Franquia" },
  { accessorKey: "email", header: "Email de Contato" },
  { 
    accessorKey: "subscriptionPlan",
    header: "Plano",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("subscriptionPlan")}</Badge>
  },
  { 
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? 'Ativa' : 'Inativa'}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              {/* --- ÍCONE ADICIONADO AQUI --- */}
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <Link href={`/matriz/franquias/${row.original.id}`}>
              <DropdownMenuItem>Editar</DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];