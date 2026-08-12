import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CSV_PATH = path.resolve(process.cwd(), "real_csv.csv");

type CSVRow = Record<string, string>;

function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) return null;

  const cleaned = String(value).trim();

  return cleaned === "" ? null : cleaned;
}

function parseNumber(value: unknown): number | null {
  const cleaned = cleanString(value);

  if (cleaned === null) return null;

  const normalized = cleaned.replace(/,/g, "").replace(/[₱$]/g, "").trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

function parseCSV(text: string): CSVRow[] {
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (insideQuotes && next === '"') {
        field += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }

      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") {
        i++;
      }

      row.push(field);
      field = "";

      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);

    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((values) => {
    const result: CSVRow = {};

    headers.forEach((header, index) => {
      result[header] = values[index] ?? "";
    });

    return result;
  });
}

function getCSVProduct(row: CSVRow) {
  return {
    productName: cleanString(row.Product_Name),
    masterCategory: cleanString(row.Master_Category),
    gramRange: cleanString(row.Grams),
    pricePerGram: parseNumber(row.Price_Per_Grams),
    price: parseNumber(row.Selling_Price) ?? 0,
    stock: parseNumber(row.Stock) ?? 0,
    supplier: cleanString(row.Supplier) ?? "",

    productIdShopee: cleanString(row.Product_ID_Shopee),
    variationIdShopee: cleanString(row.Variation_ID_Shopee),
    variationNameShopee: cleanString(row.Variation_Name_Shopee),

    productIdLazada: cleanString(row.Product_ID_Lazada),
    skuIdLazada: cleanString(row.SKU_ID_Lazada),
    keyLazada: cleanString(row.Key_Lazada),
    quantityLazada: parseNumber(row.Quantity_Lazada),
    variationNameLazada: cleanString(row.Variation_Name_Lazada),

    productIdTiktok: cleanString(row.Product_ID_Tiktok),
    skuIdTiktok: cleanString(row.SKU_ID_Tiktok),
    variationNameTiktok: cleanString(row.Variation_Name_Tiktok),
    categoryTiktok: cleanString(row.Category_Tiktok),
    quantityTiktok: parseNumber(row.Quantity_Tiktok),
  };
}

async function main() {
  console.log("=================================");
  console.log("REAL IMPORT CHANGE PREVIEW");
  console.log("=================================");

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found: ${CSV_PATH}`);
  }

  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(csvText);

  console.log(`CSV rows: ${rows.length}`);
  console.log("");

  const existingProducts = await prisma.product.findMany();

  console.log(`Existing database products: ${existingProducts.length}`);

  const shopeeMap = new Map<string, (typeof existingProducts)[0]>();
  const lazadaMap = new Map<string, (typeof existingProducts)[0]>();
  const tiktokMap = new Map<string, (typeof existingProducts)[0]>();

  for (const product of existingProducts) {
    if (product.productIdShopee && product.variationIdShopee) {
      shopeeMap.set(
        `${product.productIdShopee}:${product.variationIdShopee}`,
        product
      );
    }

    if (product.productIdLazada && product.skuIdLazada) {
      lazadaMap.set(
        `${product.productIdLazada}:${product.skuIdLazada}`,
        product
      );
    }

    if (product.productIdTiktok && product.skuIdTiktok) {
      tiktokMap.set(
        `${product.productIdTiktok}:${product.skuIdTiktok}`,
        product
      );
    }
  }

  let newCount = 0;
  let updateCount = 0;

  const previews: string[] = [];

  for (const row of rows) {
    const csv = getCSVProduct(row);

    let existing = null;
    let matchedBy = "";

    /*
     * 1. Try Shopee
     */
    if (csv.productIdShopee && csv.variationIdShopee) {
      const key = `${csv.productIdShopee}:${csv.variationIdShopee}`;

      const match = shopeeMap.get(key);

      if (match) {
        existing = match;
        matchedBy = "Shopee";
      }
    }

    /*
     * 2. Try Lazada
     */
    if (!existing) {
      if (csv.productIdLazada && csv.skuIdLazada) {
        const key = `${csv.productIdLazada}:${csv.skuIdLazada}`;

        const match = lazadaMap.get(key);

        if (match) {
          existing = match;
          matchedBy = "Lazada";
        }
      }
    }

    /*
     * 3. Try TikTok
     */
    if (!existing) {
      if (csv.productIdTiktok && csv.skuIdTiktok) {
        const key = `${csv.productIdTiktok}:${csv.skuIdTiktok}`;

        const match = tiktokMap.get(key);

        if (match) {
          existing = match;
          matchedBy = "TikTok";
        }
      }
    }

    /*
     * NEW PRODUCT
     */
    if (!existing) {
      newCount++;
      continue;
    }

    /*
     * EXISTING PRODUCT
     */
    updateCount++;

    const changes: string[] = [];

    if (existing.productName !== csv.productName) {
      changes.push(
        `productName: "${existing.productName}" → "${csv.productName}"`
      );
    }

    if (existing.masterCategory !== csv.masterCategory) {
      changes.push(
        `masterCategory: "${existing.masterCategory}" → "${csv.masterCategory}"`
      );
    }

    if (existing.gramRange !== csv.gramRange) {
      changes.push(`gramRange: "${existing.gramRange}" → "${csv.gramRange}"`);
    }

    if (Number(existing.pricePerGram) !== csv.pricePerGram) {
      changes.push(
        `pricePerGram: ${existing.pricePerGram} → ${csv.pricePerGram}`
      );
    }

    if (Number(existing.price) !== csv.price) {
      changes.push(`price: ${existing.price} → ${csv.price}`);
    }

    if (existing.stock !== csv.stock) {
      changes.push(`stock: ${existing.stock} → ${csv.stock}`);
    }

    if (existing.supplier !== csv.supplier) {
      changes.push(`supplier: "${existing.supplier}" → "${csv.supplier}"`);
    }

    if (existing.productIdShopee !== csv.productIdShopee) {
      changes.push(
        `Shopee Product ID: ${existing.productIdShopee} → ${csv.productIdShopee}`
      );
    }

    if (existing.variationIdShopee !== csv.variationIdShopee) {
      changes.push(
        `Shopee Variation ID: ${existing.variationIdShopee} → ${csv.variationIdShopee}`
      );
    }

    if (existing.variationNameShopee !== csv.variationNameShopee) {
      changes.push(
        `Shopee Variation Name: "${existing.variationNameShopee}" → "${csv.variationNameShopee}"`
      );
    }

    if (existing.productIdLazada !== csv.productIdLazada) {
      changes.push(
        `Lazada Product ID: ${existing.productIdLazada} → ${csv.productIdLazada}`
      );
    }

    if (existing.skuIdLazada !== csv.skuIdLazada) {
      changes.push(`Lazada SKU: ${existing.skuIdLazada} → ${csv.skuIdLazada}`);
    }

    if (existing.keyLazada !== csv.keyLazada) {
      changes.push(`Lazada Key: ${existing.keyLazada} → ${csv.keyLazada}`);
    }

    if (existing.variationNameLazada !== csv.variationNameLazada) {
      changes.push(
        `Lazada Variation: "${existing.variationNameLazada}" → "${csv.variationNameLazada}"`
      );
    }

    if (existing.productIdTiktok !== csv.productIdTiktok) {
      changes.push(
        `TikTok Product ID: ${existing.productIdTiktok} → ${csv.productIdTiktok}`
      );
    }

    if (existing.skuIdTiktok !== csv.skuIdTiktok) {
      changes.push(`TikTok SKU: ${existing.skuIdTiktok} → ${csv.skuIdTiktok}`);
    }

    if (existing.variationNameTiktok !== csv.variationNameTiktok) {
      changes.push(
        `TikTok Variation: "${existing.variationNameTiktok}" → "${csv.variationNameTiktok}"`
      );
    }

    if (existing.categoryTiktok !== csv.categoryTiktok) {
      changes.push(
        `TikTok Category: "${existing.categoryTiktok}" → "${csv.categoryTiktok}"`
      );
    }

    if (changes.length > 0) {
      previews.push(
        [
          `Database ID: ${existing.id}`,
          `Matched by: ${matchedBy}`,
          `Product: ${csv.productName}`,
          "",
          ...changes.map((change) => `  ${change}`),
          "",
          "---------------------------------",
        ].join("\n")
      );
    }
  }

  console.log("");
  console.log("=================================");
  console.log("IMPORT PREVIEW COMPLETE");
  console.log("=================================");

  console.log(`CSV rows: ${rows.length}`);
  console.log(`Would CREATE: ${newCount}`);
  console.log(`Would UPDATE: ${updateCount}`);
  console.log(`Existing records with changes: ${previews.length}`);

  /*
   * Show changes.
   */

  if (previews.length > 0) {
    console.log("");
    console.log("========== EXISTING RECORD CHANGES ==========");

    previews.slice(0, 50).forEach((preview) => {
      console.log(preview);
    });

    if (previews.length > 50) {
      console.log(`Showing first 50 of ${previews.length} changed records.`);
    }
  } else {
    console.log("");
    console.log("No existing database values would change.");
  }

  console.log("");
  console.log("=================================");
  console.log("NO DATABASE CHANGES WERE MADE.");
  console.log("=================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("ERROR:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
