import prisma from "../lib/prisma.js";

async function main() {
  const result = await prisma.product.deleteMany();

  console.log(`🗑 Deleted ${result.count} products.`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
