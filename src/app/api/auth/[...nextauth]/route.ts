/*
 * =================================================================
 * FICHEIRO: Rota da API de Autenticação
 * Localização: src/app/api/auth/[...nextauth]/route.ts
 * =================================================================
 * ESTE É UM FICHEIRO CRÍTICO.
 * O nome da pasta "[...nextauth]" é uma convenção do Next.js e NextAuth
 * que captura todas as requisições para /api/auth/* (como /session,
 * /signin, /signout, etc.) e as direciona para este único ficheiro.
 * Se este ficheiro estiver no local errado, a autenticação NUNCA funcionará.
 */
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Importando a nossa configuração de autenticação

// A função NextAuth() lê as suas authOptions e cria automaticamente
// todos os endpoints da API necessários.
const handler = NextAuth(authOptions);

// Exportamos o handler para os métodos GET e POST, que são os únicos
// que o NextAuth utiliza para as suas operações.
export { handler as GET, handler as POST };