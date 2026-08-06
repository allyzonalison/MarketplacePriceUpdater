import { getPriceGroup } from "../services/priceGroup.service.js";

const products = [
  "Pawnable 18K Gold Heart Earrings",
  "Pawnable 18K Gold Heart Earrings (ELECTROFORM)",
  "Pawnable 18K Gold Couple Ring",
  "Pawnable 24K Gold Slim Plain Ring",
  "Pawnable 18K Gold Pearl Necklace",
  "24K Gold Bar",
];

for (const product of products) {
  console.log(product);
  console.log(" ->", getPriceGroup(product));
}
