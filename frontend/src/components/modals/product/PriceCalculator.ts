export function calculateSellingPrice(
  grams: string,
  pricePerGram: number | null
): number | null {
  if (!grams.trim() || pricePerGram == null) {
    return null;
  }

  const match = grams.match(/^\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*$/);

  if (!match) {
    return null;
  }

  const highestWeight = parseFloat(match[2]);

  return Math.trunc((highestWeight * pricePerGram) / 0.8);
}
