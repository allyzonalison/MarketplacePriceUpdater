export interface VariantRow {
  clientId: string;

  id: number | null;

  // =====================================================
  // USER INPUT
  // =====================================================

  // This is the variation name entered by the user.
  //
  // For NEW products:
  // - Shopee  -> blank
  // - Lazada  -> this value
  // - TikTok  -> this value, or "Default" if blank
  //
  variationName: string;

  supplier: string;

  grams: string;
  pricePerGram: number | null;
  sellingPrice: number | null;

  stock: number;

  // =====================================================
  // SHOPEE
  // =====================================================

  variationNameShopee: string | null;
  productIdShopee: string | null;
  variationIdShopee: string | null;

  // =====================================================
  // LAZADA
  // =====================================================

  variationNameLazada: string | null;
  productIdLazada: string | null;
  skuIdLazada: string | null;
  keyLazada: string | null;
  quantityLazada: number | null;

  // =====================================================
  // TIKTOK
  // =====================================================

  variationNameTiktok: string | null;
  productIdTiktok: string | null;
  skuIdTiktok: string | null;
  categoryTiktok: string | null;
  quantityTiktok: number | null;
}
