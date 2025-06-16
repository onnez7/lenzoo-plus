/*
 * =================================================================
 * FICHEIRO 1: O CLIENTE PRISMA (A nossa nova ligação à BD)
 * Localização: src/lib/prisma.ts
 * =================================================================
 * Este ficheiro substitui o nosso antigo "index.ts" do Drizzle.
 * Ele cria uma única instância do Prisma Client, uma prática recomendada
 * para evitar esgotar as ligações à base de dados, especialmente
 * em desenvolvimento.
 */
import { PrismaClient } from '@prisma/client'

// Declara uma variável global para armazenar a instância do Prisma.
declare global {
  var prisma: PrismaClient | undefined
}

// Cria a instância do Prisma. Se já existir uma instância global, reutiliza-a.
// Caso contrário, cria uma nova. Isto previne múltiplas instâncias em ambiente
// de desenvolvimento devido ao hot-reloading do Next.js.
export const prisma = global.prisma || new PrismaClient()

// Se não estivermos em produção, atribuímos a instância criada à variável global.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}