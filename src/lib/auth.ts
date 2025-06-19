/*
 * =================================================================
 * FICHEIRO 1: CONFIGURAÇÃO DE AUTENTICAÇÃO (CORRIGIDO)
 * Localização: src/lib/auth.ts
 * =================================================================
 * Corrigi os callbacks 'jwt' e 'session' para que eles incluam
 * o 'franchiseId' em todo o fluxo de autenticação.
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (isPasswordCorrect) {
          return user;
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as User;
        // --- CORREÇÃO AQUI ---
        // Adicionamos o franchiseId ao token no momento do login.
        token.id = u.id;
        token.role = u.role;
        token.franchiseId = u.franchiseId;
        token.labId = u.labId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // --- CORREÇÃO AQUI ---
      // Passamos os dados do token para a sessão, que fica disponível na aplicação.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.franchiseId = token.franchiseId as number | null;
        session.user.labId = token.labId as number | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};