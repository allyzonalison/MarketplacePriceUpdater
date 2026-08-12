import api from "./api";
import type { Product } from "../types/product";

export interface PreviewPriceRequest {
  group: string;
  supplier: string;
  pricePerGram: number;
}

export const previewGroupPrice = async (
  data: PreviewPriceRequest
): Promise<Product[]> => {
  const response = await api.post("/prices/preview", data);

  return response.data;
};

export const applyGroupPrice = async (
  data: PreviewPriceRequest
): Promise<{
  total: number;
}> => {
  const response = await api.post("/prices/apply", data);

  return response.data;
};

export interface CurrentPrices {
  regularItems: number | null;
  electroform: number | null;
  rings24k: number | null;
  coupleRings: number | null;
}

export const getCurrentPrices = async (): Promise<CurrentPrices> => {
  const response = await api.get("/prices/current");

  return response.data;
};
