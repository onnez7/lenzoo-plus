import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { NewOrderForm } from "../../_components/new-order-form"; // Ajuste no caminho de importação

interface EditOrderPageProps {
    params: { orderId: string; };
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
    const session = await getServerSession(authOptions);
    const franchiseId = session?.user?.franchiseId ? parseInt(session.user.franchiseId, 10) : null;

    const orderId = parseInt(params.orderId, 10);
    const order = await prisma.order.findUnique({
        where: { id: orderId, franchiseId: franchiseId },
        include: { items: true },
    });

    if (!order) {
        notFound();
    }

    const clients = await prisma.client.findMany({ where: { franchiseId } });
    const products = await prisma.product.findMany({ where: { OR: [{ franchiseId: null }, { franchiseId }] } });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Alterar OS #{order.id}</h1>
                <p className="text-muted-foreground">Modifique os detalhes do pedido abaixo.</p>
            </div>
            <NewOrderForm clients={clients} products={products} order={order} />
        </div>
    );
}