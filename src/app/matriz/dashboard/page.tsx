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
import MatrizDashboard from "./_components/matriz-dashboard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    // Se o utilizador for admin da matriz, renderiza o dashboard da Matriz
    if (session.user.role === UserRole.MATRIZ_ADMIN) {
        return <MatrizDashboard />;
    }
}