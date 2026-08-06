import api from "./api";
import type { Product } from "../types/product";

export interface PreviewPriceRequest {
  group: string;
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
): Promise<void> => {
  await api.post("/prices/apply", data);
};
