'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Lab } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Lab>[] = [
  { accessorKey: "name", header: "Nome do Laboratório" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Telefone" },
  { 
    accessorKey: "isActive", header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return <Badge variant={isActive ? "default" : "destructive"}>{isActive ? 'Ativo' : 'Inativo'}</Badge>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <Link href={`/matriz/laboratorios/${row.original.id}`}><DropdownMenuItem>Editar</DropdownMenuItem></Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];