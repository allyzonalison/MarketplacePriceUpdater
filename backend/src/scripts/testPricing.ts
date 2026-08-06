import { applyPrices } from "../services/pricing.service.js";

await applyPrices({
  regular: 8500,
  electroform: 8200,
  ring24k: 9300,
  couple: 8700,
});
