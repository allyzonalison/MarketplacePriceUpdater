import ExcelJS from "exceljs";
import prisma from "../lib/prisma.js";
import { getSocketServer } from "../lib/socket.js";

const normalize = (value: string | null | undefined) =>
  (value ?? "")
    // Normalize Unicode characters
    .normalize("NFKC")

    // Remove invisible Unicode characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")

    // Convert all whitespace variations to normal spaces
    .replace(/\s+/g, " ")

    // Remove spaces at the beginning/end
    .trim()

    // Make matching case-insensitive
    .toLowerCase();

const makeProductKey = (
  productName: string | null | undefined,
  variationName: string | null | undefined
) => {
  return `${normalize(productName)}|||${normalize(variationName)}`;
};

export const exportShopee = async (buffer: Buffer) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.load(buffer as any);

  const worksheet = workbook.worksheets[0];

  const io = getSocketServer();

  // --------------------------------------------------
  // LOAD PRODUCTS ONCE
  // --------------------------------------------------

  const products = await prisma.product.findMany();

  console.log(`Loaded ${products.length} products from database.`);

  // --------------------------------------------------
  // CREATE FAST LOOKUP MAP
  //
  // Instead of searching the entire products array
  // for every Excel row, we create:
  //
  // "product name + variation" -> product
  //
  // This changes the lookup from O(n) to approximately O(1).
  // --------------------------------------------------

  const productMap = new Map<string, (typeof products)[number]>();

  for (const product of products) {
    const key = makeProductKey(
      product.productName,
      product.variationNameShopee
    );

    // Preserve the behavior of Array.find():
    // keep the first matching product.
    if (!productMap.has(key)) {
      productMap.set(key, product);
    }
  }

  console.log(`Created product lookup map with ${productMap.size} entries.`);

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------

  const total = Math.max(worksheet.rowCount - 6, 0);
  let completed = 0;

  // Only send progress updates every 25 rows.
  // Sending 5,000+ socket messages is unnecessary.
  const PROGRESS_INTERVAL = 25;

  // --------------------------------------------------
  // PROCESS EXCEL
  // --------------------------------------------------

  for (let rowNumber = 7; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    const shopeeProductId = row.getCell("A").text.trim();
    const productName = row.getCell("B").text.trim();
    const shopeeVariationId = row.getCell("C").text.trim();
    const variationName = row.getCell("D").text.trim();

    const key = makeProductKey(productName, variationName);

    // FAST LOOKUP
    const product = productMap.get(key);

    if (!product) {
      console.warn("====================================");
      console.warn("❌ SHOPEE PRODUCT NOT MATCHED");
      console.warn("Excel Product:", JSON.stringify(productName));
      console.warn("Excel Variation:", JSON.stringify(variationName));
      console.warn("Normalized Product:", normalize(productName));
      console.warn("Normalized Variation:", normalize(variationName));
      console.warn("====================================");

      completed++;

      if (completed % PROGRESS_INTERVAL === 0 || completed === total) {
        io.emit("price-update-progress", {
          completed,
          total,
          percent: total === 0 ? 100 : Math.round((completed / total) * 100),
        });
      }

      continue;
    }

    // --------------------------------------------------
    // UPDATE SHOPEE INFORMATION ONLY IF NECESSARY
    // --------------------------------------------------

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

      // Keep our in-memory product synchronized.
      product.productIdShopee = shopeeProductId;
      product.variationIdShopee = shopeeVariationId;
      product.variationNameShopee = variationName === "" ? null : variationName;
    }

    // --------------------------------------------------
    // UPDATE EXCEL
    // --------------------------------------------------

    row.getCell("G").value = Number(product.price);

    row.getCell("I").value = product.stock;

    completed++;

    // --------------------------------------------------
    // SEND OCCASIONAL PROGRESS
    // --------------------------------------------------

    if (completed % PROGRESS_INTERVAL === 0 || completed === total) {
      io.emit("price-update-progress", {
        completed,
        total,
        percent: total === 0 ? 100 : Math.round((completed / total) * 100),
      });
    }
  }

  // --------------------------------------------------
  // EXPORT COMPLETE
  // --------------------------------------------------

  io.emit("price-update-complete");

  console.log("Writing updated Excel workbook...");

  const output = await workbook.xlsx.writeBuffer();

  console.log("Shopee export completed successfully.");

  return output;
};
