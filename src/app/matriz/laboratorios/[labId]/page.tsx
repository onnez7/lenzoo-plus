import LabForm from "../_components/lab-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
export default async function EditLabPage({ params }: { params: { labId: string } }) {
    const lab = await prisma.lab.findUnique({ where: { id: parseInt(params.labId) } });
    if (!lab) notFound();
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Laboratório</h1>
            <LabForm lab={lab} />
        </div>
    );
}