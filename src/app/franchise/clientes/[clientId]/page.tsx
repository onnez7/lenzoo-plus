/*
 * =================================================================
 * FICHEIRO 7: A NOVA PÁGINA DINÂMICA DE EDIÇÃO
 * Localização: src/app/(franchise)/clientes/[clientId]/page.tsx
 * =================================================================
 * Esta página busca os dados de um cliente específico pelo ID na URL
 * e passa esses dados para o nosso formulário reutilizável.
 */
import ClientForm from "../_components/client-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditClientPageProps {
    params: {
        clientId: string;
    }
}

export default async function EditClientPage({ params }: EditClientPageProps) {
    const client = await prisma.client.findUnique({
        where: {
            id: parseInt(params.clientId, 10),
        },
    });

    if (!client) {
        notFound();
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Editar Cliente</h1>
                <p className="text-muted-foreground">Atualize os dados do cliente abaixo.</p>
            </div>
            {/* Passamos o cliente encontrado para o formulário */}
            <ClientForm client={client} />
        </div>
    )
}
