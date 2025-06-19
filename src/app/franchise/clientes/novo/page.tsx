/*
 * =================================================================
 * FICHEIRO 4: A PÁGINA DE CRIAÇÃO DE CLIENTE (Sem alterações)
 * Localização: src/app/(franchise)/clientes/novo/page.tsx
 * =================================================================
 */
import ClientForm from "../_components/client-form";

export default function NewClientPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Adicionar Novo Cliente</h1>
                <p className="text-muted-foreground">Preencha os dados abaixo para criar um novo cliente.</p>
            </div>
            <ClientForm />
        </div>
    )
}
