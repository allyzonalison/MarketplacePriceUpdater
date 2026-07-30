import { Request, Response } from "express";
import { getAllProducts } from "../services/product.service.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await getAllProducts();

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch products.",
    });
  }
};
