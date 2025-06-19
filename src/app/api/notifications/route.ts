import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse("Não autorizado", { status: 401 });
        }

        const userId = parseInt(session.user.id);
        const whereClause = session.user.role === 'LAB_USER'
            ? { labUserId: userId }
            : { userId: userId };

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        return NextResponse.json({ notifications });

    } catch (error) {
        return new NextResponse("Erro interno do servidor", { status: 500 });
    }
}