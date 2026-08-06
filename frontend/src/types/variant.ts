export interface VariantRow {
  clientId: string;

  id: number | null;

  variationName: string;
  supplier: string;

  grams: string;
  pricePerGram: number | null;
  sellingPrice: number | null;

  stock: number;

  // Shopee
  productIdShopee: string | null;
  variationIdShopee: string | null;

  // Lazada
  variationNameLazada: string | null;
  productIdLazada: string | null;
  skuIdLazada: string | null;
  keyLazada: string | null;
  quantityLazada: number | null;

  // TikTok
  variationNameTiktok: string | null;
  productIdTiktok: string | null;
  skuIdTiktok: string | null;
  categoryTiktok: string | null;
  quantityTiktok: number | null;
}
