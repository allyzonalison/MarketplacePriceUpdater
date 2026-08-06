export enum PriceGroup {
  MANUAL = "MANUAL",
  ELECTROFORM = "ELECTROFORM",
  RING_24K = "RING_24K",
  COUPLE = "COUPLE",
  REGULAR = "REGULAR",
}

export const getPriceGroup = (productName: string): PriceGroup => {
  const name = productName.toLowerCase();

  // Manual Pricing
  if (
    name.includes("pearl") ||
    name.includes("customize") ||
    name.includes("24k gold bar") ||
    name.includes("24k mini chinese gold bar") ||
    name.includes("24k chinese gold bar") ||
    name.includes("pawnable 24k saudi gold piyao rope bracelet") ||
    name.includes("pawnable 24k saudi gold piyao lock bracelet") ||
    name.includes("pawnable 18k gold coral bracelet")
  ) {
    return PriceGroup.MANUAL;
  }

  // Electroform
  if (name.includes("(electroform)")) {
    return PriceGroup.ELECTROFORM;
  }

  // 24K Rings
  if (
    productName === "Pawnable 24K Gold Solid Slim Plain Ring" ||
    productName === "Pawnable 24K Gold Slim Plain Ring"
  ) {
    return PriceGroup.RING_24K;
  }

  // Couple Rings
  if (name.includes("couple")) {
    return PriceGroup.COUPLE;
  }

  return PriceGroup.REGULAR;
};
