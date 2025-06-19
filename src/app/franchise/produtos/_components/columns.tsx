'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Product } from "@prisma/client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const isGlobal = !row.original.franchiseId;
      return (
        <div className="flex items-center font-medium">
          {isGlobal && <Badge variant="secondary"><Globe className="h-3 w-3 mr-1"/>Global</Badge>}
          <span className="ml-2">{row.getValue("name")}</span>
        </div>
      )
    }
  },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "category", header: "Categoria" },
  {
    accessorKey: "salePrice",
    header: "Preço de Venda",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("salePrice") || "0");
      return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      
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
              <Link href={`/franchise/produtos/${product.id}`}>
                <DropdownMenuItem>
                  Ver / Editar
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];