import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CSV_PATH = path.resolve(process.cwd(), "real_csv.csv");

type CSVRow = Record<string, string>;

function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();

  return cleaned === "" ? null : cleaned;
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

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());

  return rows.slice(1).map((values) => {
    const result: CSVRow = {};

    headers.forEach((header, index) => {
      result[header] = values[index] ?? "";
    });

    return result;
  });
}

async function main() {
  console.log("=================================");
  console.log("REAL DATABASE CONFLICT CHECK");
  console.log("=================================");

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found: ${CSV_PATH}`);
  }

  const csvText = fs.readFileSync(CSV_PATH, "utf8");
  const rows = parseCSV(csvText);

  console.log(`CSV rows: ${rows.length}`);
  console.log("");

  /*
   * Load the existing products from Neon.
   */
  const databaseProducts = await prisma.product.findMany({
    select: {
      id: true,
      productName: true,
      masterCategory: true,
      gramRange: true,
      productIdShopee: true,
      variationIdShopee: true,
      productIdLazada: true,
      skuIdLazada: true,
      productIdTiktok: true,
      skuIdTiktok: true,
    },
  });

  console.log(`Existing database products: ${databaseProducts.length}`);

  /*
   * Create lookup maps.
   */

  const shopeeMap = new Map<string, (typeof databaseProducts)[0]>();

  const lazadaMap = new Map<string, (typeof databaseProducts)[0]>();

  const tiktokMap = new Map<string, (typeof databaseProducts)[0]>();

  for (const product of databaseProducts) {
    if (product.productIdShopee && product.variationIdShopee) {
      const key = `${product.productIdShopee}:${product.variationIdShopee}`;

      shopeeMap.set(key, product);
    }

    if (product.productIdLazada && product.skuIdLazada) {
      const key = `${product.productIdLazada}:${product.skuIdLazada}`;

      lazadaMap.set(key, product);
    }

    if (product.productIdTiktok && product.skuIdTiktok) {
      const key = `${product.productIdTiktok}:${product.skuIdTiktok}`;

      tiktokMap.set(key, product);
    }
  }

  /*
   * Results.
   */

  let existingByShopee = 0;
  let existingByLazada = 0;
  let existingByTiktok = 0;

  let newProducts = 0;

  const conflicts: string[] = [];

  /*
   * Check every CSV row.
   */

  for (const row of rows) {
    const productName = cleanString(row.Product_Name) ?? "(Unnamed product)";

    const shopeeProductId = cleanString(row.Product_ID_Shopee);

    const shopeeVariationId = cleanString(row.Variation_ID_Shopee);

    const lazadaProductId = cleanString(row.Product_ID_Lazada);

    const lazadaSkuId = cleanString(row.SKU_ID_Lazada);

    const tiktokProductId = cleanString(row.Product_ID_Tiktok);

    const tiktokSkuId = cleanString(row.SKU_ID_Tiktok);

    let found = false;

    /*
     * SHOPEE MATCH
     */

    if (shopeeProductId && shopeeVariationId) {
      const key = `${shopeeProductId}:${shopeeVariationId}`;

      const existing = shopeeMap.get(key);

      if (existing) {
        existingByShopee++;
        found = true;

        if (existing.productName !== productName) {
          conflicts.push(
            `Shopee ID ${key}: CSV="${productName}" DATABASE="${existing.productName}"`
          );
        }
      }
    }

    /*
     * LAZADA MATCH
     */

    if (lazadaProductId && lazadaSkuId) {
      const key = `${lazadaProductId}:${lazadaSkuId}`;

      if (lazadaMap.has(key)) {
        existingByLazada++;
        found = true;
      }
    }

    /*
     * TIKTOK MATCH
     */

    if (tiktokProductId && tiktokSkuId) {
      const key = `${tiktokProductId}:${tiktokSkuId}`;

      if (tiktokMap.has(key)) {
        existingByTiktok++;
        found = true;
      }
    }

    if (!found) {
      newProducts++;
    }
  }

  /*
   * FINAL REPORT
   */

  console.log("");
  console.log("=================================");
  console.log("CONFLICT CHECK COMPLETE");
  console.log("=================================");

  console.log(`CSV products: ${rows.length}`);

  console.log(`Existing by Shopee ID: ${existingByShopee}`);

  console.log(`Existing by Lazada ID: ${existingByLazada}`);

  console.log(`Existing by TikTok ID: ${existingByTiktok}`);

  console.log(`Potentially new products: ${newProducts}`);

  console.log(`Potential name conflicts: ${conflicts.length}`);

  /*
   * Show conflicts.
   */

  if (conflicts.length > 0) {
    console.log("");
    console.log("========== POTENTIAL CONFLICTS ==========");

    conflicts.slice(0, 50).forEach((conflict, index) => {
      console.log(`${index + 1}. ${conflict}`);
    });

    if (conflicts.length > 50) {
      console.log(`...and ${conflicts.length - 50} more`);
    }
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
