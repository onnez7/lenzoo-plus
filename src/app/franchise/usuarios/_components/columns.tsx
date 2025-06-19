/*
 * =================================================================
 * FICHEIRO 2: AS COLUNAS DA TABELA DE COLABORADORES
 * Localização: src/app/(franchise)/usuarios/_components/columns.tsx
 * =================================================================
 */
'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, UserRole, Status } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Função",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      return <Badge variant="outline">{role === 'FRANCHISE_ADMIN' ? 'Admin' : 'Colaborador'}</Badge>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
     cell: ({ row }) => {
      const status = row.getValue("status") as Status;
      const isActive = status === Status.ACTIVE;
      return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <Link href={`/usuarios/${user.id}`}>
                <DropdownMenuItem>Editar</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];