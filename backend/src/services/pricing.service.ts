import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { getSocketServer } from "../lib/socket.js";

import { getPriceGroup, PriceGroup } from "./priceGroup.service.js";

const calculateSellingPrice = (
  gramRange: string,
  pricePerGram: number
): number => {
  // Products without a range (ex. "1.00")
  // are manually priced and should not be calculated.
  if (!gramRange.includes("-")) {
    throw new Error("Product does not have a gram range.");
  }

  const upperGram = Number(gramRange.split("-")[1].trim());

  return Math.trunc((upperGram * pricePerGram) / 0.8);
};

export interface ApplyGroupPriceInput {
  group: PriceGroup;
  pricePerGram: number;
}

export const previewGroupPrice = async ({
  group,
  pricePerGram,
}: ApplyGroupPriceInput) => {
  const products = await prisma.product.findMany();

  const previewProducts = [];

  for (const product of products) {
    if (product.isManualPrice) {
      continue;
    }

    const productGroup = getPriceGroup(product.productName);

    if (productGroup !== group) {
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
  pricePerGram,
}: ApplyGroupPriceInput) => {
  const io = getSocketServer();
  const products = await prisma.product.findMany();

  const productsToUpdate = products.filter((product) => {
    if (product.isManualPrice) return false;

    return getPriceGroup(product.productName) === group;
  });

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

  console.log(`🎉 ${group} price update completed.`);
};
