-- CreateTable
CREATE TABLE "franchise_available_products" (
    "franchiseId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "franchise_available_products_pkey" PRIMARY KEY ("franchiseId","productId")
);

-- AddForeignKey
ALTER TABLE "franchise_available_products" ADD CONSTRAINT "franchise_available_products_franchiseId_fkey" FOREIGN KEY ("franchiseId") REFERENCES "franchises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "franchise_available_products" ADD CONSTRAINT "franchise_available_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
