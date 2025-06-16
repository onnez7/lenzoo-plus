/*
 * =================================================================
 * FICHEIRO 2: AUTENTICAÇÃO ATUALIZADA (Usando Prisma)
 * Localização: src/lib/auth.ts
 * =================================================================
 * Esta é a versão do nosso ficheiro de autenticação que usa o Prisma
 * para procurar e validar os utilizadores.
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma"; // <-- IMPORTANTE: Importando o nosso novo Prisma Client
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // AGORA USANDO PRISMA: Busca o utilizador na base de dados pelo e-mail.
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return null; // Utilizador não encontrado
        }
        
        // A lógica de comparação de senha permanece a mesma.
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
            return null; // Senha incorreta
        }

        // Retorna o objeto do utilizador para criar a sessão.
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role, // O papel vem diretamente do nosso modelo Prisma
          franchiseId: user.franchiseId?.toString() // O ID da franquia também
        };
      },
    }),
  ],
  
  // Os callbacks permanecem os mesmos, pois a sua função é passar
  // os dados para o token e para a sessão, independentemente da base de dados.
  callbacks: {
    jwt: async ({ token, user }) => {
        if (user) {
            token.id = user.id;
            token.role = user.role;
            token.franchiseId = user.franchiseId;
        }
        return token;
    },
    session: async ({ session, token }) => {
        if (token && session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
            session.user.franchiseId = token.franchiseId as string;
        }
        return session;
    },
  },

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};