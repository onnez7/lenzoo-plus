-- CreateEnum
CREATE TYPE "WhatsAppProvider" AS ENUM ('TWILIO', 'ZAPI');

-- AlterTable
ALTER TABLE "franchises" ADD COLUMN     "whatsAppApiSecret" TEXT,
ADD COLUMN     "whatsAppApiToken" TEXT,
ADD COLUMN     "whatsAppInstanceId" TEXT,
ADD COLUMN     "whatsAppProvider" "WhatsAppProvider";
