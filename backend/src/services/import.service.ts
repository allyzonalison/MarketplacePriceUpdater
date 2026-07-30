import path from "path";

import prisma from "../lib/prisma.js";
import { readCsv } from "../utils/csv.js";
import { ProductCsv } from "../types/productCsv.js";
import { Prisma } from "@prisma/client";

const parseDecimal = (value: string) => {
  return new Prisma.Decimal(value.replace(/,/g, "").trim());
};

export const importProducts = async () => {
  const filePath = path.join(process.cwd(), "data", "sample_data.csv");

  const rows = await readCsv<ProductCsv>(filePath);
  console.log(`📄 Found ${rows.length} rows.`);

  for (const row of rows) {
    console.log(`Importing: ${row.Product_Name}`);
    await prisma.product.create({
      data: {
        masterCategory: row.Master_Category,
        productName: row.Product_Name,

        gramRange: row.Grams.trim(),
        pricePerGram: parseDecimal(row.Price_Per_Grams),
        price: parseDecimal(row.Selling_Price),

        isManualPrice: false,

        stock: Number(row.Stock),
        supplier: row.Supplier,

        variationNameLazada: row.Variation_Name_Lazada,
        productIdLazada: row.Product_ID_Lazada,
        skuIdLazada: row.SKU_ID_Lazada,
        keyLazada: row.Key_Lazada,
        quantityLazada: Number(row.Quantity_Lazada),

        productIdShopee: row.Product_ID_Shopee,
        variationIdShopee: row.Variation_ID_Shopee,
        variationNameShopee: row.Variation_Name_Shopee,

        productIdTiktok: row.Product_ID_Tiktok,
        skuIdTiktok: row.SKU_ID_Tiktok,
        variationNameTiktok: row.Variation_Name_Tiktok,
        categoryTiktok: row.Category_Tiktok,
        quantityTiktok: Number(row.Quantity_Tiktok),
      },
    });
  }

  return rows.length;
};
