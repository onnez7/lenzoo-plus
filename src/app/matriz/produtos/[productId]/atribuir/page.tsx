import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AssignmentForm } from "./_components/assignment-form";

interface ProductAssignmentPageProps {
    params: {
        productId: string;
    }
}

export default async function ProductAssignmentPage({ params }: ProductAssignmentPageProps) {
    const productId = parseInt(params.productId, 10);

    const product = await prisma.product.findUnique({
        where: { id: productId, franchiseId: null },
    });

    const franchises = await prisma.franchise.findMany({
        orderBy: { name: 'asc' },
        include: {
            availableProducts: {
                where: { productId: productId }
            }
        }
    });

    if (!product) {
        notFound();
    }
    
    const initialData = franchises.map(f => ({
        franchiseId: f.id,
        name: f.name,
        isAssigned: f.availableProducts.length > 0
    }));

    return (
        <div className="p-6">
             <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Atribuir Produto</h1>
                <p className="text-muted-foreground">Selecione quais franquias terão acesso ao produto <span className="font-semibold">"{product.name}"</span>.</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Lista de Franquias</CardTitle>
                    <CardDescription>Marque as caixas para dar acesso ao produto.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AssignmentForm productId={productId} franchises={initialData} />
                </CardContent>
            </Card>
        </div>
    );
}