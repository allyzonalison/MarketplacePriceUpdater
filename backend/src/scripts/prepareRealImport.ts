import fs from "fs";
import path from "path";

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

  isManualPrice: boolean;
}

/* =========================================================
   CONFIG
========================================================= */

const CSV_PATH = path.resolve(process.cwd(), "real_csv.csv");

/* =========================================================
   HELPERS
========================================================= */

function cleanString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  const cleaned = String(value).trim();

  return cleaned === "" ? null : cleaned;
}

function parseNumber(value: unknown): number | null {
  const cleaned = cleanString(value);

  if (cleaned === null) {
    return null;
  }

  // Remove commas, currency symbols, spaces, etc.
  const normalized = cleaned.replace(/,/g, "").replace(/[₱$]/g, "").trim();

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

/* =========================================================
   CSV PARSER
   Handles quoted values containing commas.
========================================================= */

function parseCSV(text: string): CSVRow[] {
  const rows: string[][] = [];

  let row: string[] = [];
  let field = "";
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
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
      if (char === "\r" && nextChar === "\n") {
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

  // Last field / row
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
   PREPARE ONE PRODUCT
========================================================= */

function prepareProduct(row: CSVRow): PreparedProduct {
  const productName = cleanString(row.Product_Name);

  if (!productName) {
    throw new Error("Missing Product_Name");
  }

  const masterCategory = cleanString(row.Master_Category);

  if (!masterCategory) {
    throw new Error(`Missing Master_Category for product: ${productName}`);
  }

  /*
   * IMPORTANT:
   * Supplier is allowed to be blank.
   *
   * Your real CSV contains products that currently
   * do not have a supplier.
   */
  const supplier = cleanString(row.Supplier) ?? "";

  /*
   * IMPORTANT:
   * Blank Stock automatically becomes 0.
   */
  const stock = parseNumber(row.Stock) ?? 0;

  /*
   * IMPORTANT:
   * Some products such as the Saudi Gold Kadena Ring
   * don't currently have a Selling_Price.
   *
   * We therefore use 0 instead of rejecting the row.
   */
  const price = parseNumber(row.Selling_Price) ?? 0;

  const pricePerGram = parseNumber(row.Price_Per_Grams);

  return {
    productName,

    masterCategory,

    gramRange: cleanString(row.Grams),

    pricePerGram,

    price,

    stock,

    supplier,

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

    /* =========================
       PRICE CONTROL
    ========================= */

    isManualPrice: false,
  };
}

/* =========================================================
   MAIN DRY RUN
========================================================= */

function main() {
  console.log("=================================");
  console.log("REAL DATABASE IMPORT DRY RUN");
  console.log("=================================");

  console.log(`CSV: ${CSV_PATH}`);
  console.log("");

  /* =========================
     CHECK FILE
  ========================= */

  if (!fs.existsSync(CSV_PATH)) {
    console.error("ERROR: CSV file does not exist.");
    console.error("");
    console.error(`Expected file: ${CSV_PATH}`);
    console.error("");
    console.error("Make sure real_csv.csv is inside the backend folder.");

    process.exit(1);
  }

  /* =========================
     READ CSV
  ========================= */

  const csvText = fs.readFileSync(CSV_PATH, "utf8");

  const rows = parseCSV(csvText);

  console.log(`CSV rows: ${rows.length}`);

  /* =========================
     PREPARE PRODUCTS
  ========================= */

  const preparedProducts: PreparedProduct[] = [];
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const product = prepareProduct(row);

      preparedProducts.push(product);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      errors.push(message);
    }
  }

  /* =========================
     STATISTICS
  ========================= */

  const productsWithShopeeIds = preparedProducts.filter(
    (product) => product.productIdShopee && product.variationIdShopee
  ).length;

  const productsWithoutShopeeIds =
    preparedProducts.length - productsWithShopeeIds;

  const productsWithZeroStock = preparedProducts.filter(
    (product) => product.stock === 0
  ).length;

  /* =========================
     RESULTS
  ========================= */

  console.log("");
  console.log("=================================");
  console.log("DRY RUN COMPLETE");
  console.log("=================================");

  console.log(`Total rows: ${rows.length}`);

  console.log(`Prepared successfully: ${preparedProducts.length}`);

  console.log(`Rows with errors: ${errors.length}`);

  console.log(`Products with Shopee IDs: ${productsWithShopeeIds}`);

  console.log(`Products without Shopee IDs: ${productsWithoutShopeeIds}`);

  console.log(`Products with stock = 0: ${productsWithZeroStock}`);

  /* =========================
     SAMPLE PRODUCTS
  ========================= */

  console.log("");
  console.log("========== SAMPLE PRODUCTS ==========");

  preparedProducts.slice(0, 3).forEach((product, index) => {
    console.log("");
    console.log(`Product ${index + 1}:`);
    console.log(product);
  });

  /* =========================
     ERRORS
  ========================= */

  if (errors.length > 0) {
    console.log("");
    console.log("========== ERRORS ==========");

    errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  /* =========================
     IMPORTANT
  ========================= */

  console.log("");
  console.log("=================================");
  console.log("NO DATABASE CHANGES WERE MADE.");
  console.log("=================================");
}

main();
