import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NewOrderForm } from "@/app/franchise/pedidos/_components/new-order-form";

export default async function NewOrderPage() {
  const session = await getServerSession(authOptions);
  const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId) : null;

  // Busca todos os clientes e produtos da franquia para os seletores do formulário
  const clients = await prisma.client.findMany({
    where: { franchiseId: franchiseId },
    orderBy: { name: 'asc' },
  });

  const products = await prisma.product.findMany({
    where: {
      OR: [
        { franchiseId: null }, // Produtos da Matriz
        { franchiseId: franchiseId }, // Produtos locais
      ],
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Criar Nova Venda / OS</h1>
        <p className="text-muted-foreground">Selecione o cliente e adicione os itens ao pedido.</p>
      </div>
      <NewOrderForm clients={clients} products={products} />
    </div>
  );
}