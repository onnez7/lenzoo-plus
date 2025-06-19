import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole, Status } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import GoalSetter from "./_components/goal-setter";

export default async function SalesGoalsPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== UserRole.FRANCHISE_ADMIN) redirect("/dashboard");

    const franchiseId = parseInt(session.user.franchiseId as string);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const employees = await prisma.user.findMany({
        where: { franchiseId, role: UserRole.EMPLOYEE, status: Status.ACTIVE },
        include: {
            salesGoals: {
                where: { year: currentYear, month: currentMonth }
            },
            orders: {
                where: {
                    status: { notIn: [Status.CANCELLED, Status.DRAFT] },
                    createdAt: {
                        gte: new Date(currentYear, currentMonth - 1, 1),
                        lt: new Date(currentYear, currentMonth, 1)
                    }
                },
                select: { totalAmount: true }
            }
        }
    });

    const employeesWithProgress = employees.map(emp => {
        const goal = emp.salesGoals[0]?.targetAmount || 0;
        const currentSales = emp.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const progress = goal > 0 ? (currentSales / Number(goal)) * 100 : 0;
        return {
            id: emp.id,
            name: emp.name,
            goal: Number(goal),
            currentSales: currentSales,
            progress: Math.min(progress, 100)
        };
    });

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Metas de Vendas</h1>
                <p className="text-muted-foreground">Defina e acompanhe as metas de vendas da sua equipa para o mês atual.</p>
            </div>
            
            <div className="grid gap-6">
                {employeesWithProgress.map(emp => (
                    <Card key={emp.id}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>{emp.name}</CardTitle>
                                <CardDescription>Progresso da meta de {new Date().toLocaleString('pt-BR', { month: 'long' })}</CardDescription>
                            </div>
                           <GoalSetter employeeId={emp.id} currentGoal={emp.goal} />
                        </CardHeader>
                        <CardContent>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-medium text-primary">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(emp.currentSales)}</span>
                                <span className="text-muted-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(emp.goal)}</span>
                            </div>
                            <Progress value={emp.progress} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}