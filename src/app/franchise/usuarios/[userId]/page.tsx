// FICHEIRO para: src/app/(franchise)/usuarios/[userId]/page.tsx
import UserForm from "@/app/franchise/usuarios/_components/user-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
export default async function EditUserPage({ params }: { params: { userId: string } }) {
    const user = await prisma.user.findUnique({ where: { id: parseInt(params.userId) } });
    if (!user) notFound();
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Editar Colaborador</h1>
            <UserForm user={user} />
        </div>
    );
}