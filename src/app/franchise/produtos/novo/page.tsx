/*
 * =================================================================
 * FICHEIRO 3: A PÁGINA DE CRIAÇÃO DE PRODUTO
 * Localização: src/app/(franchise)/produtos/novo/page.tsx
 * =================================================================
 */
import ProductForm from "@/app/franchise/produtos/_components/product-form";

export default function NewProductPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Adicionar Novo Produto Local</h1>
                <p className="text-muted-foreground">Este produto será visível apenas na sua franquia.</p>
            </div>
            <ProductForm />
        </div>
    )
}