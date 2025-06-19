/*
 * =================================================================
 * FICHEIRO 1: A PÁGINA "PORTEIRO" DO DASHBOARD
 * Localização: src/app/(franchise)/dashboard/page.tsx
 * =================================================================
 */
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import FranchiseDashboard from "./_components/franchise-dashboard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Para todos os outros papéis, renderiza o dashboard do Franqueado
    return <FranchiseDashboard session={session} />;
}