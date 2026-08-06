export function isValidWeightRange(value: string): boolean {
  const text = value.trim();

  // Manual products
  if (/^\d+(\.\d+)?$/.test(text)) {
    return true;
  }

  // Range products
  if (/^\d+(\.\d+)?\s*-\s*\d+(\.\d+)?$/.test(text)) {
    return true;
  }

  return false;
}

export function isPositiveNumber(value: number | null): boolean {
  return value !== null && value > 0;
}

export function isWholeNumber(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}
