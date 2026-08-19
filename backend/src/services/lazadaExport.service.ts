import ExcelJS from "exceljs";
import prisma from "../lib/prisma.js";
import { getSocketServer } from "../lib/socket.js";

const normalize = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const exportLazada = async (buffer: Buffer) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.getWorksheet("template");

  if (!worksheet) {
    throw new Error('Lazada "template" sheet was not found.');
  }

  const io = getSocketServer();

  /*
   * Lazada template:
   *
   * C = Product Name
   * M = Price
   * N = Variations Combo
   *
   * Data starts at row 5.
   */

  const products = await prisma.product.findMany();

  console.log(`Loaded ${products.length} products from database.`);

  /*
   * Build a lookup map first.
   *
   * This is much faster than using products.find()
   * for every Excel row.
   */
  const productMap = new Map<string, (typeof products)[number]>();

  for (const product of products) {
    const key =
      `${normalize(product.productName)}|||` +
      `${normalize(product.variationNameLazada)}`;

    productMap.set(key, product);
  }

  const total = Math.max(worksheet.rowCount - 4, 0);
  let completed = 0;
  let matched = 0;
  let unmatched = 0;

  for (let rowNumber = 5; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const productName = row.getCell("C").text.trim();
    const variationName = row.getCell("N").text.trim();

    /*
     * Ignore completely empty rows.
     */
    if (!productName && !variationName) {
      continue;
    }

    const key = `${normalize(productName)}|||` + `${normalize(variationName)}`;

    const product = productMap.get(key);

    if (!product) {
      unmatched++;

      console.log("====================================");
      console.log("❌ LAZADA NO MATCH");
      console.log("Row:", rowNumber);
      console.log("Excel Product:", JSON.stringify(productName));
      console.log("Excel Variation:", JSON.stringify(variationName));

      continue;
    }

    matched++;

    console.log(
      `✅ Lazada Match | Row: ${rowNumber} | ` +
        `Product: "${product.productName}" | ` +
        `Variation: "${product.variationNameLazada}" | ` +
        `New Price: ${product.price}`
    );

    /*
     * IMPORTANT:
     *
     * Column M is the ONLY Excel value we intentionally modify.
     */
    row.getCell("M").value = Number(product.price);

    completed++;

    io.emit("price-update-progress", {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 100,
    });
  }

  console.log("====================================");
  console.log("Lazada Export Finished");
  console.log(`Matched: ${matched}`);
  console.log(`Unmatched: ${unmatched}`);
  console.log(`Processed: ${completed}`);
  console.log("====================================");

  io.emit("price-update-complete");

  return workbook.xlsx.writeBuffer();
};
