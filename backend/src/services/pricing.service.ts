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

    if (!product.gramRange) {
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

  console.log("================================");
  console.log("STARTING PRICE UPDATE");
  console.log("Group:", group);
  console.log("Supplier:", supplier);
  console.log("New price per gram:", pricePerGram);
  console.log("================================");

  /*
   * Get products that belong to this price group.
   */
  const products = await prisma.product.findMany();

  const productsToUpdate = products.filter((product) => {
    if (product.isManualPrice) {
      return false;
    }

    if (getPriceGroup(product.productName) !== group) {
      return false;
    }

    if (supplier !== "ALL" && product.supplier !== supplier) {
      return false;
    }

    return Boolean(product.gramRange);
  });

  const total = productsToUpdate.length;

  console.log("Products to update:", total);

  /*
   * Tell frontend the total immediately.
   */
  io.emit("price-update-progress", {
    completed: 0,
    total,
    percent: 0,
  });

  /*
   * Group products by their resulting selling price.
   *
   * Example:
   *
   * 0.25 - 0.30 -> ₱187
   * 0.30 - 0.35 -> ₱218
   * 0.35 - 0.40 -> ₱250
   *
   * Instead of doing thousands of UPDATE queries,
   * we can do one UPDATE per price group.
   */
  const updateGroups = new Map<number, number[]>();

  for (const product of productsToUpdate) {
    if (!product.gramRange) {
      continue;
    }

    const newPrice = calculateSellingPrice(product.gramRange, pricePerGram);

    const existing = updateGroups.get(newPrice) ?? [];

    existing.push(product.id);

    updateGroups.set(newPrice, existing);
  }

  console.log("Number of database update groups:", updateGroups.size);

  /*
   * Update each price group.
   *
   * This is dramatically faster than updating
   * every product individually.
   */
  let completed = 0;

  for (const [newPrice, productIds] of updateGroups) {
    await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },

      data: {
        price: new Prisma.Decimal(newPrice),

        pricePerGram: new Prisma.Decimal(pricePerGram),
      },
    });

    completed += productIds.length;

    const percent = total === 0 ? 100 : Math.round((completed / total) * 100);

    const progress = {
      completed,
      total,
      percent,
    };

    console.log(`📤 Progress: ${completed}/${total} (${percent}%)`);

    io.emit("price-update-progress", progress);
  }

  /*
   * Make sure frontend receives 100%.
   */
  io.emit("price-update-progress", {
    completed: total,
    total,
    percent: 100,
  });

  io.emit("price-update-complete");

  console.log("================================");
  console.log("PRICE UPDATE COMPLETE");
  console.log(`Updated ${total} products.`);
  console.log("================================");

  return {
    total,
  };
};

export const getCurrentPrices = async () => {
  const products = await prisma.product.findMany();

  return {
    regularItems:
      products.find((p) => getPriceGroup(p.productName) === PriceGroup.REGULAR)
        ?.pricePerGram ?? null,

    electroform:
      products.find(
        (p) => getPriceGroup(p.productName) === PriceGroup.ELECTROFORM
      )?.pricePerGram ?? null,

    rings24k:
      products.find((p) => getPriceGroup(p.productName) === PriceGroup.RING_24K)
        ?.pricePerGram ?? null,

    coupleRings:
      products.find((p) => getPriceGroup(p.productName) === PriceGroup.COUPLE)
        ?.pricePerGram ?? null,
  };
};
