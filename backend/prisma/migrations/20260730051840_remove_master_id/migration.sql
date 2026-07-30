/*
  Warnings:

  - You are about to drop the column `masterId` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_masterId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "masterId";
