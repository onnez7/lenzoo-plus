/*
 * =================================================================
 * FICHEIRO 1: A PÁGINA PRINCIPAL DE GESTÃO DE COLABORADORES
 * Localização: src/app/(franchise)/usuarios/page.tsx
 * =================================================================
 */
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { DataTable } from "@/app/franchise/clientes/_components/data-table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== UserRole.FRANCHISE_ADMIN) {
    redirect("/dashboard");
  }

  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId) : null;

  const users = await prisma.user.findMany({
    where: {
      franchiseId: franchiseId,
      id: { not: parseInt(session.user.id) } 
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Colaboradores</h1>
          <p className="text-muted-foreground">Adicione e gira os utilizadores da sua equipa.</p>
        </div>
        <Button asChild>
          <Link href="/franchise/usuarios/novo">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={users} />
    </div>
  );
}