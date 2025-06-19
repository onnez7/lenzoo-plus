import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { DataTable } from "@/components/shared/data-table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function FranchiseProductsPage() {
  const session = await getServerSession(authOptions);
  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;

  if (!franchiseId) {
    // Se por alguma razão não houver ID de franquia, mostra uma lista vazia.
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
            <p className="text-muted-foreground">Utilizador não associado a uma franquia.</p>
        </div>
    );
  }
  
  // --- LÓGICA ATUALIZADA ---
  // 1. Busca os IDs dos produtos globais atribuídos a esta franquia.
  const availableGlobalProductIds = await prisma.franchiseAvailableProduct.findMany({
      where: { franchiseId: franchiseId },
      select: { productId: true },
  }).then(results => results.map(r => r.productId));

  // 2. Busca os produtos que são:
  //    - Locais desta franquia (têm o franchiseId correto)
  //    - OU Globais e estão na lista de produtos atribuídos.
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { franchiseId: franchiseId }, 
        { 
            id: { in: availableGlobalProductIds },
            franchiseId: null 
        },
      ],
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Seus Produtos</h1>
          <p className="text-muted-foreground">Visualize os produtos locais e os disponibilizados pela Matriz.</p>
        </div>
        <Button asChild>
          <Link href="/franchise/produtos/novo">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Produto Local
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  );
}