import fs from "fs";
import path from "path";
import csv from "csv-parser";

const csvPath = path.resolve(process.cwd(), "real_csv.csv");

interface CsvRow {
  Master_Category: string;
  Product_Name: string;
  Grams: string;
  Price_Per_Grams: string;
  Selling_Price: string;
  Supplier: string;
  Product_ID_Shopee: string;
  Variation_ID_Shopee: string;
  Variation_Name_Shopee: string;
  Stock: string;
}

let totalRows = 0;
let rowsWithShopeeIds = 0;
let rowsWithoutShopeeIds = 0;
let rowsWithEmptyStock = 0;

console.log("=================================");
console.log("REAL DATABASE IMPORT DRY RUN");
console.log("=================================");
console.log("CSV:", csvPath);
console.log("");

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (row: CsvRow) => {
    totalRows++;

    const stock =
      row.Stock === undefined || row.Stock === null || row.Stock.trim() === ""
        ? 0
        : Number(row.Stock);

    if (stock === 0) {
      rowsWithEmptyStock++;
    }

    if (row.Product_ID_Shopee?.trim() && row.Variation_ID_Shopee?.trim()) {
      rowsWithShopeeIds++;
    } else {
      rowsWithoutShopeeIds++;
    }
  })
  .on("end", () => {
    console.log("=================================");
    console.log("DRY RUN COMPLETE");
    console.log("=================================");

    console.log("Total rows:", totalRows);
    console.log("Rows with Shopee IDs:", rowsWithShopeeIds);
    console.log("Rows without Shopee IDs:", rowsWithoutShopeeIds);
    console.log("Empty Stock → 0:", rowsWithEmptyStock);

    console.log("=================================");
    console.log("NO DATABASE CHANGES WERE MADE.");
    console.log("=================================");
  })
  .on("error", (error) => {
    console.error("Failed to read CSV:", error);
  });
