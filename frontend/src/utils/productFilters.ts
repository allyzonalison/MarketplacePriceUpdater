import type { Product } from "../types/product";

export function matchesFilter(product: Product, filter: string): boolean {
  // -----------------------------
  // ALL PRODUCTS
  // -----------------------------

  if (!filter || filter === "all") {
    return true;
  }

  const productName = String(product.productName ?? "").toLowerCase();

  const masterCategory = String(product.masterCategory ?? "").toLowerCase();

  const supplier = String(product.supplier ?? "").toLowerCase();

  // -----------------------------
  // CATEGORIES
  // -----------------------------

  if (
    ["earrings", "pendant", "bracelet_anklet", "necklace", "ring"].includes(
      filter.toLowerCase()
    )
  ) {
    return masterCategory === filter.toLowerCase();
  }

  // -----------------------------
  // SUPPLIERS
  // -----------------------------

  if (["668", "fg", "sk", "gs"].includes(filter.toLowerCase())) {
    return supplier === filter.toLowerCase();
  }

  // -----------------------------
  // ELECTROFORM
  // -----------------------------

  if (filter === "Electroform") {
    return productName.includes("electroform");
  }

  // -----------------------------
  // COUPLE RINGS
  // -----------------------------

  if (filter === "Couple Rings") {
    return productName.includes("couple");
  }

  // -----------------------------
  // 24K GOLD RINGS
  // -----------------------------

  if (filter === "24K Gold Rings") {
    return (
      productName === "pawnable 24k gold solid slim plain ring" ||
      productName === "pawnable 24k gold slim plain ring"
    );
  }

  // -----------------------------
  // MANUAL PRICING
  // -----------------------------

  if (filter === "Manual Pricing") {
    const manualKeywords = [
      "pearl",
      "piyao",
      "coral",
      "customize",
      "24k gold bar",
      "24k mini chinese gold bar",
      "24k chinese gold bar",
    ];

    return manualKeywords.some((keyword) => productName.includes(keyword));
  }

  return true;
}
