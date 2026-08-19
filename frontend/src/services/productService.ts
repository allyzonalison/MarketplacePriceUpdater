import api from "./api";
import type { Product } from "../types/product";

export interface CreateProductPayload {
  productName: string;
  category: string;

  preserveMarketplaceValues?: boolean;

  rows: {
    variationName: string;
    supplier: string;
    grams: string;
    pricePerGram: number | null;
    sellingPrice: number;
    stock: number;

    variationNameShopee?: string | null;
    variationNameLazada?: string | null;
    variationNameTiktok?: string | null;
  }[];
}

export const getProducts = async (
  search = "",
  filter = "all"
): Promise<Product[]> => {
  const response = await api.get("/products", {
    params: {
      page: 1,
      limit: 5000,
      search,
      filter,
    },
  });

  return response.data.products;
};

export const updateProduct = async (
  id: number,
  data: Partial<Product>
): Promise<Product> => {
  const payload = {
    ...data,
    pricePerGram: data.pricePerGram,
    gramRange: data.gramRange?.trim() === "" ? null : data.gramRange,
  };

  const response = await api.patch(`/products/${id}`, payload);

  return response.data;
};

export const createProduct = async (data: CreateProductPayload) => {
  const response = await api.post("/products", data);

  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};
