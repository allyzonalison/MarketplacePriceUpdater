import api from "./api";
import type { Product } from "../types/product";

export interface CreateProductPayload {
  productName: string;
  category: string;

  rows: {
    variationName: string;
    supplier: string;

    grams: string;
    pricePerGram: number | null;
    sellingPrice: number;

    stock: number;
  }[];
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products");
  return response.data;
};

export const updateProduct = async (
  id: number,
  data: Partial<Product>
): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};

export const createProduct = async (data: CreateProductPayload) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};
