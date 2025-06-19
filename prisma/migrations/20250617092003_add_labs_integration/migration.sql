-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "labId" INTEGER;

-- CreateTable
CREATE TABLE "labs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lab_users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "labId" INTEGER NOT NULL,

    CONSTRAINT "lab_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "labs_name_key" ON "labs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "labs_email_key" ON "labs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "lab_users_email_key" ON "lab_users"("email");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lab_users" ADD CONSTRAINT "lab_users_labId_fkey" FOREIGN KEY ("labId") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
