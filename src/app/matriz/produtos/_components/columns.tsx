'use client'

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuTrigger, 
    DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Product } from "@prisma/client";
import Link from "next/link";

export const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Nome do Produto" },
  { accessorKey: "sku", header: "SKU / Código" },
  { accessorKey: "category", header: "Categoria" },
  {
    accessorKey: "salePrice",
    header: "Preço Sugerido (Venda)",
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
                {/* --- ÍCONE ADICIONADO AQUI --- */}
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <Link href={`/matriz/produtos/${product.id}`}>
                <DropdownMenuItem>Editar Produto</DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link href={`/matriz/produtos/${product.id}/atribuir`}>
                <DropdownMenuItem>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Gerir Atribuições
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];