import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { getSocketServer } from "../lib/socket.js";

import { getPriceGroup, PriceGroup } from "./priceGroup.service.js";

const calculateSellingPrice = (
  gramRange: string,
  pricePerGram: number
): number => {
  if (!gramRange.includes("-")) {
    throw new Error("Product does not have a gram range.");
  }

  const upperGram = Number(gramRange.split("-")[1].trim());

  return Math.trunc((upperGram * pricePerGram) / 0.8);
};

export interface ApplyGroupPriceInput {
  group: PriceGroup;
  supplier: string;
  pricePerGram: number;
}

export const previewGroupPrice = async ({
  group,
  supplier,
  pricePerGram,
}: ApplyGroupPriceInput) => {
  const products = await prisma.product.findMany();

  const previewProducts = [];

  for (const product of products) {
    if (product.isManualPrice) {
      continue;
    }

    if (getPriceGroup(product.productName) !== group) {
      continue;
    }

    if (supplier !== "ALL" && product.supplier !== supplier) {
      continue;
    }

    const newPrice = calculateSellingPrice(product.gramRange, pricePerGram);

    previewProducts.push({
      ...product,
      price: new Prisma.Decimal(newPrice),
      pricePerGram: new Prisma.Decimal(pricePerGram),
    });
  }

  return previewProducts;
};

export const applyGroupPrice = async ({
  group,
  supplier,
  pricePerGram,
}: ApplyGroupPriceInput) => {
  const io = getSocketServer();

  const products = await prisma.product.findMany();

  console.log("Selected supplier:", supplier);

  const productsToUpdate = products.filter((product) => {
    if (product.isManualPrice) {
      return false;
    }

    if (getPriceGroup(product.productName) !== group) {
      return false;
    }

    console.log(
      product.productName,
      "| Database supplier:",
      product.supplier,
      "| Selected supplier:",
      supplier
    );

    if (supplier !== "ALL" && product.supplier !== supplier) {
      return false;
    }

    return true;
  });

  console.log("================================");
  console.log("Products that will be updated:");

  productsToUpdate.forEach((p) => {
    console.log(
      `${p.productName} | Supplier: ${p.supplier} | Price: ${p.price}`
    );
  });

  console.log("Total:", productsToUpdate.length);
  console.log("================================");

  const total = productsToUpdate.length;

  let completed = 0;

  const updates = productsToUpdate.map(async (product) => {
    const newPrice = calculateSellingPrice(product.gramRange, pricePerGram);

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        price: new Prisma.Decimal(newPrice),
        pricePerGram: new Prisma.Decimal(pricePerGram),
      },
    });

    completed++;

    io.emit("price-update-progress", {
      completed,
      total,
      percent: Math.round((completed / total) * 100),
    });
  });

  await Promise.all(updates);

  io.emit("price-update-complete");

  console.log(`🎉 ${group} (${supplier}) price update completed.`);
};
