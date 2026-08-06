export interface VariantDTO {
  variationName: string;
  supplier: string;

  grams: string;

  pricePerGram: number | null;
  sellingPrice: number | null;

  stock: number;
}

export interface CreateProductDTO {
  productName: string;
  category: string;

  rows: VariantDTO[];
}
