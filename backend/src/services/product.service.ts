import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import type { CreateProductDTO } from "../types/product.dto.js";

export interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  filter?: string;
}

export const getAllProducts = async ({
  page = 1,
  limit = 5000,
  search = "",
  filter = "all",
}: GetProductsOptions = {}) => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const safeLimit =
    Number.isFinite(limit) && limit > 0
      ? Math.min(Math.floor(limit), 5000)
      : 5000;

  const skip = (safePage - 1) * safeLimit;

  const trimmedSearch = search.trim();

  const conditions: Prisma.ProductWhereInput[] = [];

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  if (trimmedSearch.length > 0) {
    conditions.push({
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
    });
  }

  // --------------------------------------------------
  // DROPDOWN FILTER
  // --------------------------------------------------

  switch (filter) {
    // Categories
    case "Earrings":
    case "Pendant":
    case "Bracelet_Anklet":
    case "Necklace":
    case "Ring":
      conditions.push({
        masterCategory: filter,
      });
      break;

    // Suppliers
    case "668":
    case "FG":
    case "SK":
    case "GS":
      conditions.push({
        supplier: filter,
      });
      break;

    // Electroform
    case "Electroform":
      conditions.push({
        productName: {
          contains: "electroform",
          mode: "insensitive",
        },
      });
      break;

    // Couple Rings
    case "Couple Rings":
      conditions.push({
        productName: {
          contains: "couple",
          mode: "insensitive",
        },
      });
      break;

    // 24K Gold Rings
    case "24K Gold Rings":
      conditions.push({
        OR: [
          {
            productName: "Pawnable 24K Gold Solid Slim Plain Ring",
          },
          {
            productName: "Pawnable 24K Gold Slim Plain Ring",
          },
        ],
      });
      break;

    // Manual Pricing
    case "Manual Pricing":
      conditions.push({
        OR: [
          {
            productName: {
              contains: "pearl",
              mode: "insensitive",
            },
          },
          {
            productName: {
              contains: "piyao",
              mode: "insensitive",
            },
          },
          {
            productName: {
              contains: "coral",
              mode: "insensitive",
            },
          },
          {
            productName: {
              contains: "customize",
              mode: "insensitive",
            },
          },
          {
            productName: {
              contains: "24k gold bar",
              mode: "insensitive",
            },
          },
          {
            productName: {
              contains: "24k mini chinese gold bar",
              mode: "insensitive",
            },
          },
          {
            productName: {
              contains: "24k chinese gold bar",
              mode: "insensitive",
            },
          },
        ],
      });
      break;

    default:
      break;
  }

  const where: Prisma.ProductWhereInput =
    conditions.length > 0
      ? {
          AND: conditions,
        }
      : {};

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
  const hasMultipleVariants = dto.rows.length > 1;

  return await prisma.$transaction(
    dto.rows.map((row) => {
      const variationName = row.variationName?.trim() || null;

      return prisma.product.create({
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
          // Multiple variants:
          //   use the entered variation name.
          //
          // Single variant:
          //   ALWAYS null.
          variationNameShopee: hasMultipleVariants ? variationName : null,

          productIdShopee: null,
          variationIdShopee: null,

          // --------------------------------
          // Lazada
          // --------------------------------
          // Always use the entered variation.
          // Empty input becomes null.
          variationNameLazada: variationName,

          productIdLazada: null,
          skuIdLazada: null,
          keyLazada: null,
          quantityLazada: null,

          // --------------------------------
          // TikTok
          // --------------------------------
          // Use entered variation.
          // If there is no variation, use Default.
          variationNameTiktok: hasMultipleVariants ? variationName : "Default",

          productIdTiktok: null,
          skuIdTiktok: null,
          categoryTiktok: dto.category,
          quantityTiktok: null,

          isManualPrice: false,
        },
      });
    })
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
