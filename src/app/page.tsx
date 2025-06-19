import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  // Se não houver sessão, vai para a página de login.
  if (!session?.user) {
    redirect("/login");
  }

  // Se for admin da matriz, vai para o dashboard da matriz.
  if (session.user.role === UserRole.MATRIZ_ADMIN) {
    redirect("/matriz/dashboard");
  }

  // --- NOVA LÓGICA AQUI ---
  // Se for um utilizador de laboratório, vai para o dashboard do laboratório.
  if (session.user.role === 'LAB_USER') {
    redirect("/lab/dashboard");
  }
  
  // Para todos os outros (Franqueado, Colaborador), vai para o dashboard do franqueado.
  redirect("/franchise/dashboard");

  return null; // Esta página nunca será realmente vista, apenas redireciona.
}