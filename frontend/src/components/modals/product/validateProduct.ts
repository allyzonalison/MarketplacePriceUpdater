import type { VariantRow } from "../../../types/variant";
import {
  isPositiveNumber,
  isValidWeightRange,
  isWholeNumber,
} from "./ProductValidation";

export function validateProduct(
  productName: string,
  category: string,
  rows: VariantRow[]
): string[] {
  const errors: string[] = [];

  if (!productName.trim()) {
    errors.push("Product Name is required.");
  }

  if (!category.trim()) {
    errors.push("Category is required.");
  }

  if (rows.length === 0) {
    errors.push("At least one variant is required.");
  }

  rows.forEach((row, index) => {
    const rowNo = index + 1;

    if (!row.supplier.trim()) {
      errors.push(`Row ${rowNo}: Supplier is required.`);
    }

    // Variation Name is required
    if (!row.variationName.trim()) {
      errors.push(`Row ${rowNo}: Variation Name is required.`);
    }

    // Selling Price is required
    if (!isPositiveNumber(row.sellingPrice)) {
      errors.push(`Row ${rowNo}: Invalid selling price.`);
    }

    // Gram Range is OPTIONAL
    if (row.grams.trim() !== "" && !isValidWeightRange(row.grams)) {
      errors.push(`Row ${rowNo}: Invalid grams format.`);
    }

    // Price Per Gram is OPTIONAL
    if (
      row.pricePerGram !== null &&
      row.pricePerGram !== undefined &&
      row.pricePerGram !== 0 &&
      !isPositiveNumber(row.pricePerGram)
    ) {
      errors.push(`Row ${rowNo}: Invalid price per gram.`);
    }

    /*
    if (
      String(row.pricePerGram).trim() !== "" &&
      !isPositiveNumber(row.pricePerGram)
    ) {
      errors.push(`Row ${rowNo}: Invalid price per gram.`);
    }
      */

    if (!isWholeNumber(row.stock)) {
      errors.push(`Row ${rowNo}: Invalid stock.`);
    }
  });

  return errors;
}
