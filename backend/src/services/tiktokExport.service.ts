import ExcelJS from "exceljs";
import prisma from "../lib/prisma.js";
import { getSocketServer } from "../lib/socket.js";

const normalize = (value: string | null | undefined) =>
  (value ?? "")
    .replace(/\u00A0/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const exportTikTok = async (buffer: Buffer) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.getWorksheet("Template");

  if (!worksheet) {
    throw new Error('TikTok "Template" sheet was not found.');
  }

  const io = getSocketServer();

  /*
   * TikTok template:
   *
   * C = Product Name
   * E = Variation Option
   * F = Retail Price (Local Currency)
   *
   * Data starts at row 6.
   */

  const products = await prisma.product.findMany();

  console.log(`Loaded ${products.length} products from database.`);

  /*
   * Build a lookup map using:
   *
   * Product Name + TikTok Variation Name
   */
  const productMap = new Map<string, (typeof products)[number]>();

  for (const product of products) {
    const key =
      `${normalize(product.productName)}|||` +
      `${normalize(product.variationNameTiktok)}`;

    productMap.set(key, product);
  }

  const total = Math.max(worksheet.rowCount - 5, 0);

  let completed = 0;
  let matched = 0;
  let unmatched = 0;

  for (let rowNumber = 6; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const productName = row.getCell("C").text.trim();
    const variationName = row.getCell("E").text.trim();

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
      console.log("❌ TIKTOK NO MATCH");
      console.log("Row:", rowNumber);
      console.log("Excel Product:", JSON.stringify(productName));
      console.log("Excel Variation:", JSON.stringify(variationName));

      continue;
    }

    matched++;

    console.log(
      `✅ TikTok Match | Row: ${rowNumber} | ` +
        `Product: "${product.productName}" | ` +
        `Variation: "${product.variationNameTiktok}" | ` +
        `New Price: ${product.price}`
    );

    /*
     * IMPORTANT:
     *
     * Column F is the ONLY Excel value we intentionally modify.
     */
    row.getCell("F").value = Number(product.price);

    completed++;

    io.emit("price-update-progress", {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 100,
    });
  }

  console.log("====================================");
  console.log("TikTok Export Finished");
  console.log(`Matched: ${matched}`);
  console.log(`Unmatched: ${unmatched}`);
  console.log(`Processed: ${completed}`);
  console.log("====================================");

  io.emit("price-update-complete");

  return workbook.xlsx.writeBuffer();
};
