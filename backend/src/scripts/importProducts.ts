import { importProducts } from "../services/import.service.js";

async function main() {
  try {
    console.log("🚀 Starting product import...");

    const total = await importProducts();

    console.log(`✅ Successfully imported ${total} products.`);
  } catch (error) {
    console.error("❌ Import failed:");
    console.error(error);
  } finally {
    process.exit();
  }
}

main();
