import fs from "fs";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const CSV_PATH = path.resolve(process.cwd(), "real_csv.csv");

// Number of new products inserted in each database batch.
const CREATE_BATCH_SIZE = 500;

type CSVRow = Record<string, string>;

interface PreparedProduct {
  productName: string;
  masterCategory: string;
  gramRange: string | null;

  pricePerGram: number | null;
  price: number;

  stock: number;
  supplier: string;

  productIdShopee: string | null;
  variationIdShopee: string | null;
  variationNameShopee: string | null;

  productIdLazada: string | null;
  skuIdLazada: string | null;
  keyLazada: string | null;
  quantityLazada: number | null;
  variationNameLazada: string | null;

  productIdTiktok: string | null;
  skuIdTiktok: string | null;
  variationNameTiktok: string | null;
  categoryTiktok: string | null;
  quantityTiktok: number | null;
}

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();

  if (cleaned === "" || cleaned.toLowerCase() === "null") {
    return null;
  }

  return cleaned;
}

function parseNumber(value: unknown): number | null {
  const cleaned = cleanString(value);

  if (cleaned === null) {
    return null;
  }

  const normalized = cleaned.replace(/,/g, "").replace(/[₱$]/g, "").trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

/* =========================================================
   CSV PARSER
========================================================= */

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

  // Handle final row.
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

/* =========================================================
   PREPARE CSV PRODUCT
========================================================= */

function prepareProduct(row: CSVRow): PreparedProduct {
  const productName = cleanString(row.Product_Name);

  if (!productName) {
    throw new Error("Missing Product_Name");
  }

  const masterCategory = cleanString(row.Master_Category);

  if (!masterCategory) {
    throw new Error(`Missing Master_Category for "${productName}"`);
  }

  return {
    productName,

    masterCategory,

    gramRange: cleanString(row.Grams),

    /*
     * Blank Price_Per_Grams becomes null.
     */
    pricePerGram: parseNumber(row.Price_Per_Grams),

    /*
     * Product.price is required by Prisma.
     *
     * Therefore a blank Selling_Price becomes 0.
     */
    price: parseNumber(row.Selling_Price) ?? 0,

    /*
     * The real CSV has no stock values.
     *
     * New products therefore receive 0 stock.
     *
     * Existing products are handled separately and
     * retain their current stock.
     */
    stock: parseNumber(row.Stock) ?? 0,

    /*
     * Supplier is allowed to be blank.
     */
    supplier: cleanString(row.Supplier) ?? "",

    /* =========================
       SHOPEE
    ========================= */

    productIdShopee: cleanString(row.Product_ID_Shopee),

    variationIdShopee: cleanString(row.Variation_ID_Shopee),

    variationNameShopee: cleanString(row.Variation_Name_Shopee),

    /* =========================
       LAZADA
    ========================= */

    productIdLazada: cleanString(row.Product_ID_Lazada),

    skuIdLazada: cleanString(row.SKU_ID_Lazada),

    keyLazada: cleanString(row.Key_Lazada),

    quantityLazada: parseNumber(row.Quantity_Lazada),

    variationNameLazada: cleanString(row.Variation_Name_Lazada),

    /* =========================
       TIKTOK
    ========================= */

    productIdTiktok: cleanString(row.Product_ID_Tiktok),

    skuIdTiktok: cleanString(row.SKU_ID_Tiktok),

    variationNameTiktok: cleanString(row.Variation_Name_Tiktok),

    categoryTiktok: cleanString(row.Category_Tiktok),

    quantityTiktok: parseNumber(row.Quantity_Tiktok),
  };
}

/* =========================================================
   FIND EXISTING PRODUCT
========================================================= */

function findExistingProduct(
  product: PreparedProduct,
  maps: {
    shopee: Map<string, any>;
    lazada: Map<string, any>;
    tiktok: Map<string, any>;
  }
) {
  /*
   * PRIORITY 1
   *
   * Shopee Product ID + Variation ID
   */

  if (product.productIdShopee && product.variationIdShopee) {
    const key = `${product.productIdShopee}:${product.variationIdShopee}`;

    const existing = maps.shopee.get(key);

    if (existing) {
      return existing;
    }
  }

  /*
   * PRIORITY 2
   *
   * Lazada Product ID + SKU ID
   */

  if (product.productIdLazada && product.skuIdLazada) {
    const key = `${product.productIdLazada}:${product.skuIdLazada}`;

    const existing = maps.lazada.get(key);

    if (existing) {
      return existing;
    }
  }

  /*
   * PRIORITY 3
   *
   * TikTok Product ID + SKU ID
   */

  if (product.productIdTiktok && product.skuIdTiktok) {
    const key = `${product.productIdTiktok}:${product.skuIdTiktok}`;

    const existing = maps.tiktok.get(key);

    if (existing) {
      return existing;
    }
  }

  return null;
}

/* =========================================================
   BUILD CREATE DATA
========================================================= */

function buildCreateData(product: PreparedProduct) {
  return {
    productName: product.productName,

    masterCategory: product.masterCategory,

    gramRange: product.gramRange,

    pricePerGram:
      product.pricePerGram !== null
        ? new Prisma.Decimal(product.pricePerGram)
        : null,

    price: new Prisma.Decimal(product.price),

    /*
     * New product:
     * blank stock -> 0
     */
    stock: product.stock,

    supplier: product.supplier,

    /* SHOPEE */

    productIdShopee: product.productIdShopee,

    variationIdShopee: product.variationIdShopee,

    variationNameShopee: product.variationNameShopee,

    /* LAZADA */

    productIdLazada: product.productIdLazada,

    skuIdLazada: product.skuIdLazada,

    keyLazada: product.keyLazada,

    quantityLazada: product.quantityLazada,

    variationNameLazada: product.variationNameLazada,

    /* TIKTOK */

    productIdTiktok: product.productIdTiktok,

    skuIdTiktok: product.skuIdTiktok,

    variationNameTiktok: product.variationNameTiktok,

    categoryTiktok: product.categoryTiktok,

    quantityTiktok: product.quantityTiktok,

    /*
     * All imported products start as non-manual.
     */
    isManualPrice: false,
  };
}

/* =========================================================
   BUILD UPDATE DATA
========================================================= */

function buildUpdateData(csv: PreparedProduct, existing: any) {
  const data: any = {
    /*
     * Basic product information.
     */

    productName: csv.productName,

    masterCategory: csv.masterCategory,

    /*
     * Only update Gram Range if CSV has a value.
     */

    ...(csv.gramRange !== null && {
      gramRange: csv.gramRange,
    }),

    /*
     * Only update Supplier if CSV has a value.
     *
     * Existing supplier is preserved when CSV is blank.
     */

    ...(csv.supplier !== "" && {
      supplier: csv.supplier,
    }),

    /*
     * =====================================================
     * SHOPEE
     * =====================================================
     *
     * Blank CSV ID does NOT erase existing ID.
     */

    ...(csv.productIdShopee !== null && {
      productIdShopee: csv.productIdShopee,
    }),

    ...(csv.variationIdShopee !== null && {
      variationIdShopee: csv.variationIdShopee,
    }),

    ...(csv.variationNameShopee !== null && {
      variationNameShopee: csv.variationNameShopee,
    }),

    /*
     * =====================================================
     * LAZADA
     * =====================================================
     */

    ...(csv.productIdLazada !== null && {
      productIdLazada: csv.productIdLazada,
    }),

    ...(csv.skuIdLazada !== null && {
      skuIdLazada: csv.skuIdLazada,
    }),

    ...(csv.keyLazada !== null && {
      keyLazada: csv.keyLazada,
    }),

    ...(csv.quantityLazada !== null && {
      quantityLazada: csv.quantityLazada,
    }),

    ...(csv.variationNameLazada !== null && {
      variationNameLazada: csv.variationNameLazada,
    }),

    /*
     * =====================================================
     * TIKTOK
     * =====================================================
     */

    ...(csv.productIdTiktok !== null && {
      productIdTiktok: csv.productIdTiktok,
    }),

    ...(csv.skuIdTiktok !== null && {
      skuIdTiktok: csv.skuIdTiktok,
    }),

    ...(csv.variationNameTiktok !== null && {
      variationNameTiktok: csv.variationNameTiktok,
    }),

    ...(csv.categoryTiktok !== null && {
      categoryTiktok: csv.categoryTiktok,
    }),

    ...(csv.quantityTiktok !== null && {
      quantityTiktok: csv.quantityTiktok,
    }),

    /*
     * Preserve the existing manual-price setting.
     */

    isManualPrice: existing.isManualPrice,
  };

  /*
   * =====================================================
   * STOCK
   * =====================================================
   *
   * The CSV contains no stock information.
   *
   * Therefore we intentionally DO NOT update stock
   * for existing products.
   */

  /*
   * =====================================================
   * PRICE
   * =====================================================
   *
   * Manual-price products are protected.
   */

  if (!existing.isManualPrice) {
    /*
     * Only update Price Per Gram if CSV contains one.
     */

    if (csv.pricePerGram !== null) {
      data.pricePerGram = new Prisma.Decimal(csv.pricePerGram);
    }

    /*
     * Selling Price is allowed to be 0 when
     * the CSV has no value.
     */
    data.price = new Prisma.Decimal(csv.price);
  }

  return data;
}

/* =========================================================
   MAIN
========================================================= */

async function main() {
  const confirmed = process.argv.includes("--confirm");

  console.log("=================================");

  if (confirmed) {
    console.log("REAL DATABASE IMPORT");
  } else {
    console.log("REAL DATABASE IMPORT PREVIEW");
  }

  console.log("=================================");

  /*
   * Check CSV.
   */

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV not found: ${CSV_PATH}`);
  }

  /*
   * Read CSV.
   */

  const csvText = fs.readFileSync(CSV_PATH, "utf8");

  const rows = parseCSV(csvText);

  console.log(`CSV rows: ${rows.length}`);

  /*
   * Load current products.
   */

  const existingProducts = await prisma.product.findMany();

  console.log(`Existing database products: ${existingProducts.length}`);

  /*
   * Build marketplace lookup maps.
   */

  const shopeeMap = new Map<string, any>();

  const lazadaMap = new Map<string, any>();

  const tiktokMap = new Map<string, any>();

  for (const product of existingProducts) {
    /*
     * Shopee
     */

    if (product.productIdShopee && product.variationIdShopee) {
      const key = `${product.productIdShopee}:${product.variationIdShopee}`;

      shopeeMap.set(key, product);
    }

    /*
     * Lazada
     */

    if (product.productIdLazada && product.skuIdLazada) {
      const key = `${product.productIdLazada}:${product.skuIdLazada}`;

      lazadaMap.set(key, product);
    }

    /*
     * TikTok
     */

    if (product.productIdTiktok && product.skuIdTiktok) {
      const key = `${product.productIdTiktok}:${product.skuIdTiktok}`;

      tiktokMap.set(key, product);
    }
  }

  const maps = {
    shopee: shopeeMap,
    lazada: lazadaMap,
    tiktok: tiktokMap,
  };

  /*
   * Prepare CSV.
   */

  const preparedProducts: PreparedProduct[] = [];

  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    try {
      preparedProducts.push(prepareProduct(rows[i]));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      errors.push(`CSV row ${i + 2}: ${message}`);
    }
  }

  /*
   * Never import if preparation has errors.
   */

  if (errors.length > 0) {
    console.log("");
    console.log("IMPORT STOPPED.");

    console.log(`Invalid rows: ${errors.length}`);

    errors.slice(0, 20).forEach((error) => {
      console.log(error);
    });

    throw new Error("CSV preparation failed.");
  }

  /*
   * Determine CREATE vs UPDATE.
   */

  const creates: PreparedProduct[] = [];

  const updates: {
    csv: PreparedProduct;
    existing: any;
  }[] = [];

  for (const product of preparedProducts) {
    const existing = findExistingProduct(product, maps);

    if (existing) {
      updates.push({
        csv: product,
        existing,
      });
    } else {
      creates.push(product);
    }
  }

  /*
   * Import statistics.
   */

  const manualPriceUpdates = updates.filter(
    ({ existing }) => existing.isManualPrice
  ).length;

  console.log("");
  console.log("=================================");
  console.log("IMPORT PLAN");
  console.log("=================================");

  console.log(`Products to CREATE: ${creates.length}`);

  console.log(`Products to UPDATE: ${updates.length}`);

  console.log(`Total products: ${preparedProducts.length}`);

  console.log(`Manual-price products among updates: ${manualPriceUpdates}`);

  /*
   * =====================================================
   * PREVIEW MODE
   * =====================================================
   */

  if (!confirmed) {
    console.log("");
    console.log("=================================");
    console.log("PREVIEW ONLY");
    console.log("=================================");

    console.log("No database changes were made.");

    console.log("");
    console.log("To perform the actual import, run:");

    console.log("");

    console.log("npx tsx src/scripts/importRealProducts.ts --confirm");

    return;
  }

  /*
   * =====================================================
   * ACTUAL IMPORT
   * =====================================================
   */

  console.log("");
  console.log("=================================");
  console.log("STARTING DATABASE IMPORT");
  console.log("=================================");

  let createdCount = 0;
  let updatedCount = 0;

  /*
   * =====================================================
   * CREATE NEW PRODUCTS IN BATCHES
   * =====================================================
   *
   * We intentionally do NOT put all 6,073 records
   * inside one long transaction.
   */

  for (let start = 0; start < creates.length; start += CREATE_BATCH_SIZE) {
    const batch = creates.slice(start, start + CREATE_BATCH_SIZE);

    const data = batch.map(buildCreateData);

    try {
      await prisma.product.createMany({
        data,
      });

      createdCount += batch.length;

      console.log(`Created ${createdCount}/${creates.length}`);
    } catch (error) {
      console.error("");
      console.error("CREATE BATCH FAILED");

      console.error(`Batch starting at row: ${start}`);

      console.error(error);

      throw error;
    }
  }

  /*
   * =====================================================
   * UPDATE EXISTING PRODUCTS
   * =====================================================
   *
   * There are only 45 updates, so these are quick.
   */

  for (const { csv, existing } of updates) {
    const updateData = buildUpdateData(csv, existing);

    try {
      await prisma.product.update({
        where: {
          id: existing.id,
        },

        data: updateData,
      });

      updatedCount++;

      console.log(`Updated ${updatedCount}/${updates.length}`);
    } catch (error) {
      console.error("");
      console.error("UPDATE FAILED");

      console.error(`Database ID: ${existing.id}`);

      console.error(`Product: ${csv.productName}`);

      console.error(error);

      throw error;
    }
  }

  /*
   * =====================================================
   * FINAL VERIFICATION
   * =====================================================
   */

  const finalCount = await prisma.product.count();

  console.log("");
  console.log("=================================");
  console.log("IMPORT COMPLETE");
  console.log("=================================");

  console.log(`Created: ${createdCount}`);

  console.log(`Updated: ${updatedCount}`);

  console.log(`Processed: ${createdCount + updatedCount}`);

  console.log(`Final database product count: ${finalCount}`);

  /*
   * Expected:
   *
   * 48 existing
   * + 6073 new
   * = 6121
   */

  const expectedCount = existingProducts.length + creates.length;

  console.log(`Expected database count: ${expectedCount}`);

  if (finalCount === expectedCount) {
    console.log("");
    console.log("✅ DATABASE COUNT VERIFIED.");
  } else {
    console.log("");
    console.log("⚠️ DATABASE COUNT DOES NOT MATCH EXPECTED COUNT.");

    console.log(`Expected: ${expectedCount}`);

    console.log(`Actual: ${finalCount}`);
  }
}

/* =========================================================
   RUN
========================================================= */

main()
  .catch((error) => {
    console.error("");
    console.error("=================================");
    console.error("IMPORT FAILED");
    console.error("=================================");

    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
