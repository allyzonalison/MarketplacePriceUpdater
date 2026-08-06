import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type { CreateProductDTO } from "../types/product.dto.js";

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
  });
};

export const getProductGroup = async (productName: string) => {
  return await prisma.product.findMany({
    where: {
      productName,
    },
    orderBy: {
      gramRange: "asc",
    },
  });
};

export const createProduct = async (dto: CreateProductDTO) => {
  return await prisma.$transaction(
    dto.rows.map((row) =>
      prisma.product.create({
        data: {
          productName: dto.productName,
          masterCategory: dto.category,

          supplier: row.supplier,

          gramRange: row.grams,

          pricePerGram:
            row.pricePerGram == null
              ? undefined
              : new Prisma.Decimal(row.pricePerGram),

          price:
            row.sellingPrice == null
              ? new Prisma.Decimal(0)
              : new Prisma.Decimal(row.sellingPrice),

          stock: row.stock,

          variationNameShopee:
            row.variationName?.trim() === "" ? null : row.variationName ?? null,

          variationNameLazada:
            row.variationName?.trim() === "" ? null : row.variationName ?? null,

          variationNameTiktok:
            row.variationName?.trim() === ""
              ? "Default"
              : row.variationName ?? "Default",

          categoryTiktok: dto.category,

          keyLazada: null,
          productIdLazada: null,
          productIdShopee: null,
          productIdTiktok: null,
          quantityLazada: null,
          quantityTiktok: null,
          skuIdLazada: null,
          skuIdTiktok: null,

          isManualPrice: false,
        },
      })
    )
  );
};

export const updateProduct = async (
  id: number,
  data: Prisma.ProductUpdateInput
) => {
  return await prisma.product.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteProductById = async (id: number) => {
  return await prisma.product.delete({
    where: {
      id,
    },
  });
};
