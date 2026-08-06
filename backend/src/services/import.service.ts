import path from "path";

import prisma from "../lib/prisma.js";
import { readCsv } from "../utils/csv.js";
import { ProductCsv } from "../types/productCsv.js";
import { Prisma } from "@prisma/client";

import { getPriceGroup, PriceGroup } from "../services/priceGroup.service.js";

const parseDecimal = (
  value: string,
  fieldName: string,
  productName: string
) => {
  const cleaned = value.replace(/,/g, "").trim();

  try {
    return new Prisma.Decimal(cleaned);
  } catch {
    throw new Error(
      `Invalid decimal in "${fieldName}" for product "${productName}". Value: "${value}"`
    );
  }
};

export const importProducts = async () => {
  await prisma.product.deleteMany();
  const filePath = path.join(process.cwd(), "data", "sample_data.csv");

  const rows = await readCsv<ProductCsv>(filePath);
  console.log(`📄 Found ${rows.length} rows.`);

  for (const row of rows) {
    const group = getPriceGroup(row.Product_Name);

    const hasGramRange = row.Grams.includes("-");

    const isManualPrice = group === PriceGroup.MANUAL || !hasGramRange;

    await prisma.product.create({
      data: {
        masterCategory: row.Master_Category,
        productName: row.Product_Name,

        gramRange: row.Grams.trim(),

        pricePerGram: isManualPrice
          ? null
          : parseDecimal(
              row.Price_Per_Grams,
              "Price_Per_Grams",
              row.Product_Name
            ),

        price: parseDecimal(
          row.Selling_Price,
          "Selling_Price",
          row.Product_Name
        ),

        isManualPrice,

        stock: Number(row.Stock),
        supplier: row.Supplier,

        // Lazada
        variationNameLazada: row.Variation_Name_Lazada,
        productIdLazada: row.Product_ID_Lazada,
        skuIdLazada: row.SKU_ID_Lazada,
        keyLazada: row.Key_Lazada,
        quantityLazada: Number(row.Quantity_Lazada),

        // Shopee
        productIdShopee: row.Product_ID_Shopee,
        variationIdShopee: row.Variation_ID_Shopee,
        variationNameShopee: row.Variation_Name_Shopee,

        // TikTok
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
