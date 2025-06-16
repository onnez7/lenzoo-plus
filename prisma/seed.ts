/*
 * =================================================================
 * FICHEIRO: Script de Seed
 * Localização: /prisma/seed.ts
 * =================================================================
 * Este script é executado para popular a base de dados com dados
 * iniciais, como o primeiro utilizador administrador da Matriz.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Inicializa o Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('A iniciar o processo de seed...');

  // --- DADOS DO UTILIZADOR ADMIN DA MATRIZ ---
  const adminEmail = 'admin@lenzoo.com';
  const adminPassword = 'admin'; // Senha simples para desenvolvimento

  // 1. Encriptar a senha
  //    É crucial nunca guardar senhas em texto plano.
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  console.log(`Senha para ${adminEmail} encriptada.`);

  // 2. Criar (ou atualizar) o utilizador da Matriz
  //    Usamos 'upsert' para evitar criar duplicados se o script for
  //    executado mais de uma vez.
  const matrizAdmin = await prisma.user.upsert({
    where: { email: adminEmail }, // Procura pelo e-mail
    update: {}, // Se já existir, não faz nada
    create: {
      email: adminEmail,
      name: 'Admin Matriz',
      passwordHash: hashedPassword,
      role: 'MATRIZ_ADMIN',
      // Note que 'franchiseId' não é definido, como planeado.
    },
  });

  console.log(`✅ Utilizador da Matriz criado/confirmado: ${matrizAdmin.email}`);
  console.log('---');
  console.log('Login para o Admin da Matriz:');
  console.log(`Email: ${adminEmail}`);
  console.log(`Senha: ${adminPassword}`);
  console.log('---');
  console.log('Seed concluído com sucesso!');
}

// Executa a função principal e trata possíveis erros
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Fecha a ligação com a base de dados
    await prisma.$disconnect();
  });
