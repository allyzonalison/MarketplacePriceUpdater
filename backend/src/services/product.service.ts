import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type { CreateProductDTO } from "../types/product.dto.js";

export interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAllProducts = async ({
  page = 1,
  limit = 50,
  search = "",
}: GetProductsOptions = {}) => {
  /*
   * Safety limits.
   *
   * We don't want the frontend accidentally requesting
   * thousands of products at once.
   */

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 50;

  const skip = (safePage - 1) * safeLimit;

  /*
   * Build the search filter.
   *
   * Search is performed by PostgreSQL rather than
   * downloading all products to React.
   */

  const trimmedSearch = search.trim();

  const where: Prisma.ProductWhereInput =
    trimmedSearch.length > 0
      ? {
          OR: [
            {
              productName: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              supplier: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              productIdShopee: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              variationIdShopee: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              productIdLazada: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              skuIdLazada: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              productIdTiktok: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              skuIdTiktok: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              masterCategory: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              variationNameShopee: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              variationNameLazada: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              variationNameTiktok: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
            {
              gramRange: {
                contains: trimmedSearch,
                mode: "insensitive",
              },
            },
          ],
        }
      : {};

  /*
   * Run the product query and count query together.
   */

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,

      orderBy: {
        id: "asc",
      },

      skip,

      take: safeLimit,
    }),

    prisma.product.count({
      where,
    }),
  ]);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    products,

    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,

      hasNextPage: safePage < totalPages,

      hasPreviousPage: safePage > 1,
    },
  };
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

          // --------------------------------
          // Shopee
          // --------------------------------
          // New products do NOT automatically
          // receive a Shopee variation name.
          variationNameShopee: null,

          productIdShopee: null,
          variationIdShopee: null,

          // --------------------------------
          // Lazada
          // --------------------------------
          // User's Variation input goes here.
          variationNameLazada:
            row.variationName?.trim() === "" ? null : row.variationName ?? null,

          productIdLazada: null,
          skuIdLazada: null,
          keyLazada: null,
          quantityLazada: null,

          // --------------------------------
          // TikTok
          // --------------------------------
          // TikTok uses "Default" when there
          // is no variation name.
          variationNameTiktok:
            row.variationName?.trim() === ""
              ? "Default"
              : row.variationName ?? "Default",

          productIdTiktok: null,
          skuIdTiktok: null,
          categoryTiktok: dto.category,
          quantityTiktok: null,

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
