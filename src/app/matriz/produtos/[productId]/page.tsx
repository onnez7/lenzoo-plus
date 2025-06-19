import ProductForm from "../_components/product-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditGlobalProductPage({ params }: { params: { productId: string } }) {
    const product = await prisma.product.findUnique({ where: { id: parseInt(params.productId) } });
    if (!product) notFound();
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Produto Global</h1>
            <ProductForm product={product} />
        </div>
    );
}