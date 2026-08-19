export interface VariantDTO {
  variationName: string;
  supplier: string;

  grams: string;

  pricePerGram: number | null;
  sellingPrice: number | null;

  stock: number;

  // Marketplace variation names
  variationNameShopee?: string | null;
  variationNameLazada?: string | null;
  variationNameTiktok?: string | null;
}

export interface CreateProductDTO {
  productName: string;
  category: string;

  // true when adding a variant to an existing product
  preserveMarketplaceValues?: boolean;

  rows: VariantDTO[];
}
