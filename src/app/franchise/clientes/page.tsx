/*
 * =================================================================
 * FICHEIRO 1: A PÁGINA PRINCIPAL DE CLIENTES (Sem alterações)
 * Localização: src/app/(franchise)/clientes/page.tsx
 * =================================================================
 */
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ClientsPage() {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId;

  const clients = await prisma.client.findMany({
    where: {
      franchiseId: franchiseId ? Number(franchiseId) : undefined,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
            <p className="text-muted-foreground">Visualize e gira os seus clientes.</p>
        </div>
        <Button asChild>
            <Link href="/franchise/clientes/novo">
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Cliente
            </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={clients} />
    </div>
  );
}