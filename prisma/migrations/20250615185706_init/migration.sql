-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MATRIZ_ADMIN', 'FRANCHISE_ADMIN', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'ESSENTIAL', 'PREMIUM');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'DRAFT', 'COMPLETED', 'SHIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('KIDS', 'SUN', 'MALE', 'FEMALE', 'UNISEX');

-- CreateTable
CREATE TABLE "franchises" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "address" JSONB,
    "subscriptionPlan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "franchises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "franchiseId" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "imageUrl" TEXT,
    "category" "ProductCategory",
    "costPrice" DECIMAL(10,2),
    "salePrice" DECIMAL(10,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "franchiseId" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "opticalData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "franchiseId" INTEGER NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "franchises_cnpj_key" ON "franchises"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "franchises_email_key" ON "franchises"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_key" ON "clients"("cpf");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
