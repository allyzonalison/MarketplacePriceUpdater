import prisma from "../lib/prisma.js";

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: {
      id: "asc",
    },
  });
};
