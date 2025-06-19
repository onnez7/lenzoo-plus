import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProductForm from "../_components/product-form";

interface EditProductPageProps {
    params: { productId: string; };
}

export default async function EditFranchiseProductPage({ params }: EditProductPageProps) {
    const session = await getServerSession(authOptions);
    // Convertemos para número, tratando o caso de ser nulo ou indefinido
    const franchiseId = session?.user?.franchiseId ? Number(session.user.franchiseId) : null;

    const product = await prisma.product.findUnique({
        where: { id: parseInt(params.productId, 10) },
    });

    if (!product) {
        notFound();
    }
    
    // Um produto está "bloqueado" se o seu franchiseId for diferente do franchiseId do utilizador.
    // Se o produto for da Matriz, product.franchiseId será nulo, logo será diferente.
    const isLocked = product.franchiseId !== franchiseId;

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isLocked ? "Visualizar Produto Global" : "Editar Produto Local"}
                </h1>
                <p className="text-muted-foreground">
                    {isLocked 
                        ? "Este produto é gerido pela Matriz e não pode ser alterado." 
                        : "Atualize os dados do seu produto."}
                </p>
            </div>
            <ProductForm product={product} isLocked={isLocked} />
        </div>
    );
}