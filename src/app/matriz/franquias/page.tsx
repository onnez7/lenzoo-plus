/*
 * =================================================================
 * FICHEIRO 2: A PÁGINA DE GESTÃO DE FRANQUIAS
 * Localização: src/app/(matriz)/franquias/page.tsx
 * =================================================================
 */
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { DataTable } from "@/app/franchise/clientes/_components/data-table"; // Reutilizamos a data-table
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ManageFranchisesPage() {
  const franchises = await prisma.franchise.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Franquias</h1>
          <p className="text-muted-foreground">Adicione e gira as franquias da rede Lenzoo+.</p>
        </div>
        <Button asChild>
          <Link href="/matriz/franquias/nova">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Franquia
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={franchises} />
    </div>
  );
}