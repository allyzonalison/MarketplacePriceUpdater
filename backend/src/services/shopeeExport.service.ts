import ExcelJS from "exceljs";
import prisma from "../lib/prisma.js";
import { getSocketServer } from "../lib/socket.js";

export const exportShopee = async (buffer: Buffer) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.worksheets[0];
  const io = getSocketServer();

  const products = await prisma.product.findMany();
  const total = worksheet.rowCount - 6;
  let completed = 0;

  console.log(`Loaded ${products.length} products from database.`);

  for (let rowNumber = 7; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const shopeeProductId = row.getCell("A").text.trim();
    const productName = row.getCell("B").text.trim();
    const shopeeVariationId = row.getCell("C").text.trim();
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
      console.log("====================================");
      console.log("❌ NO MATCH");
      console.log("Excel Product:", JSON.stringify(productName));
      console.log("Excel Variation:", JSON.stringify(variationName));

      const candidates = products.filter(
        (p) => normalize(p.productName) === normalize(productName)
      );

      console.log(
        "Possible matches:",
        candidates.map((c) => ({
          product: c.productName,
          variation: c.variationNameShopee,
        }))
      );

      continue;
    }

    console.log(
      `✅ Match | Product: "${product.productName}" | Variation: "${product.variationNameShopee}" | New Price: ${product.price}`
    );

    const shouldUpdate =
      product.productIdShopee !== shopeeProductId ||
      product.variationIdShopee !== shopeeVariationId ||
      normalize(product.variationNameShopee) !== normalize(variationName);

    if (shouldUpdate) {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          productIdShopee: shopeeProductId,
          variationIdShopee: shopeeVariationId,
          variationNameShopee: variationName === "" ? null : variationName,
        },
      });

      console.log(`🔄 Updated Shopee IDs for ${product.productName}`);
    }

    row.getCell("G").value = Number(product.price);
    row.getCell("I").value = product.stock;
    completed++;

    io.emit("price-update-progress", {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    });
  }

  io.emit("price-update-complete");

  return workbook.xlsx.writeBuffer();
};
