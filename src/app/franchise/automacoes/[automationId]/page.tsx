import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AutomationForm } from "../_components/automation-form";

interface EditAutomationPageProps {
    params: { automationId: string; };
}

export default async function EditAutomationPage({ params }: EditAutomationPageProps) {
    const automation = await prisma.automation.findUnique({
        where: { id: parseInt(params.automationId, 10) }
    });

    if (!automation) {
        notFound();
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Editar Automação</h1>
                <p className="text-muted-foreground">Atualize os detalhes da sua automação.</p>
            </div>
            <AutomationForm automation={automation} />
        </div>
    );
}