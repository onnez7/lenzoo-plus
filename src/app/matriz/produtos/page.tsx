import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { columns } from "./_components/columns";
import { DataTable } from "@/components/shared/data-table";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GlobalProductsPage() {
  // A Matriz vê apenas os produtos globais (onde franchiseId é nulo)
  const products = await prisma.product.findMany({
    where: {
      franchiseId: null,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos Globais</h1>
          <p className="text-muted-foreground">Adicione e gira o catálogo de produtos da rede.</p>
        </div>
        <Button asChild>
          <Link href="/matriz/produtos/novo">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Produto Global
          </Link>
        </Button>
      </div>
      <DataTable columns={columns} data={products} />
    </div>
  );
}