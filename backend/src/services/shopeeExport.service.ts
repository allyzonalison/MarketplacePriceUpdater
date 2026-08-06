import ExcelJS from "exceljs";
import prisma from "../lib/prisma.js";

export const exportShopee = async (buffer: Buffer) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.worksheets[0];

  const products = await prisma.product.findMany();

  console.log(`Loaded ${products.length} products from database.`);

  for (let rowNumber = 7; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const productName = row.getCell("B").text.trim();
    const variationName = row.getCell("D").text.trim();

    const normalize = (value: string | null | undefined) =>
      (value ?? "")
        .replace(/\u00A0/g, " ") // non-breaking spaces
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

    const product = products.find(
      (p) =>
        normalize(p.productName) === normalize(productName) &&
        normalize(p.variationNameShopee) === normalize(variationName)
    );

    if (!product) {
      console.log(
        `❌ No Match | Product: "${productName}" | Variation: "${variationName}"`
      );
      continue;
    }

    console.log(
      `✅ Match | Product: "${product.productName}" | Variation: "${product.variationNameShopee}" | New Price: ${product.price}`
    );

    row.getCell("G").value = Number(product.price);
    row.getCell("I").value = product.stock;
  }

  return workbook.xlsx.writeBuffer();
};
