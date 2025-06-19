import FranchiseForm from "../_components/franchise-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditFranchisePageProps {
    params: {
        franchiseId: string;
    }
}

export default async function EditFranchisePage({ params }: EditFranchisePageProps) {
    const franchise = await prisma.franchise.findUnique({
        where: {
            id: parseInt(params.franchiseId, 10),
        },
    });

    if (!franchise) {
        notFound();
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Editar Franquia</h1>
                <p className="text-muted-foreground">Atualize os dados da franquia "{franchise.name}".</p>
            </div>
            <FranchiseForm franchise={franchise} />
        </div>
    )
}