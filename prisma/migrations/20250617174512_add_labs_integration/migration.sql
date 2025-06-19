/*
  Warnings:

  - The values [EMPLOYEE] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `emailProvider` on the `franchises` table. All the data in the column will be lost.
  - You are about to drop the column `labUserId` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('MATRIZ_ADMIN', 'FRANCHISE_ADMIN', 'FRANCHISE_USER', 'LAB_USER');
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_labUserId_fkey";

-- AlterTable
ALTER TABLE "franchises" DROP COLUMN "emailProvider";

-- AlterTable
ALTER TABLE "lab_users" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "labUserId";

-- CreateIndex
CREATE INDEX "lab_users_email_idx" ON "lab_users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
