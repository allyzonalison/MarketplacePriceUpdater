import type { Product } from "../types/product";

export function matchesFilter(product: Product, filter: string): boolean {
  if (filter === "all") return true;

  // Categories
  if (
    ["Earrings", "Pendants", "Bracelet_Anklet", "Necklace", "Ring"].includes(
      filter
    )
  ) {
    return product.masterCategory === filter;
  }

  // Suppliers
  if (["668", "FG", "SK", "GS"].includes(filter)) {
    return product.supplier === filter;
  }

  // Special filters
  const name = product.productName.toLowerCase();

  switch (filter) {
    case "Electroform":
      return name.includes("electroform");

    case "Couple Rings":
      return name.includes("couple");

    case "24K Gold Rings":
      return (
        product.productName === "Pawnable 24K Gold Solid Slim Plain Ring" ||
        product.productName === "Pawnable 24K Gold Slim Plain Ring"
      );

    case "Manual Pricing":
      return [
        "pearl",
        "piyao",
        "coral",
        "customize",
        "24k gold bar",
        "24k mini chinese gold bar",
        "24k chinese gold bar",
      ].some((keyword) => name.includes(keyword));

    default:
      return true;
  }
}
