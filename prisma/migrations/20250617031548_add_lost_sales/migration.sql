-- CreateEnum
CREATE TYPE "LostSaleReason" AS ENUM ('PRECO_ALTO', 'MODELO_INDISPONIVEL', 'CONCORRENCIA', 'CLIENTE_INDECISO', 'ATENDIMENTO', 'OUTRO');

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "createdAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "createdAt" DROP NOT NULL;

-- CreateTable
CREATE TABLE "lost_sales" (
    "id" SERIAL NOT NULL,
    "reason" "LostSaleReason" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "franchiseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "lost_sales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lost_sales" ADD CONSTRAINT "lost_sales_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_sales" ADD CONSTRAINT "lost_sales_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
