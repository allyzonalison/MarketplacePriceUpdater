/*
  Warnings:

  - You are about to drop the column `category` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `costPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sellingPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[masterId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `grams` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `masterCategory` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `masterId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pricePerGram` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productName` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Product_sku_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "costPrice",
DROP COLUMN "name",
DROP COLUMN "sellingPrice",
DROP COLUMN "sku",
DROP COLUMN "weight",
ADD COLUMN     "categoryTiktok" TEXT,
ADD COLUMN     "grams" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "keyLazada" TEXT,
ADD COLUMN     "masterCategory" TEXT NOT NULL,
ADD COLUMN     "masterId" INTEGER NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "pricePerGram" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "productIdLazada" TEXT,
ADD COLUMN     "productIdShopee" TEXT,
ADD COLUMN     "productIdTiktok" TEXT,
ADD COLUMN     "productName" TEXT NOT NULL,
ADD COLUMN     "quantityLazada" INTEGER,
ADD COLUMN     "quantityTiktok" INTEGER,
ADD COLUMN     "skuIdLazada" TEXT,
ADD COLUMN     "skuIdTiktok" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL,
ADD COLUMN     "supplier" TEXT NOT NULL,
ADD COLUMN     "variationIdShopee" TEXT,
ADD COLUMN     "variationNameLazada" TEXT,
ADD COLUMN     "variationNameShopee" TEXT,
ADD COLUMN     "variationNameTiktok" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Product_masterId_key" ON "Product"("masterId");
