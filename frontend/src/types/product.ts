export interface Product {
  id: number;

  masterCategory: string;
  productName: string;

  // Optional for manual-priced products
  gramRange: string | null;

  // Optional for manual-priced products
  pricePerGram: number | null;

  // Always required
  price: number;

  previewPrice?: number;

  isManualPrice: boolean;

  stock: number;
  supplier: string;

  // Shopee
  variationNameShopee: string | null;
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

  createdAt: string;
  updatedAt: string;
}
