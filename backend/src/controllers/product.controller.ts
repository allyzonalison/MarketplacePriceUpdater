import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

import {
  createProduct,
  deleteProductById,
  getAllProducts,
  getProductGroup,
  updateProduct,
} from "../services/product.service.js";

export const getProducts = async (_req: Request, res: Response) => {
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

export const getProductGroupController = async (
  req: Request,
  res: Response
) => {
  try {
    const rawProductName = req.params.productName;

    const productName = decodeURIComponent(
      Array.isArray(rawProductName) ? rawProductName[0] : rawProductName ?? ""
    );

    const products = await getProductGroup(productName);

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch product group.",
    });
  }
};

export const createNewProduct = async (req: Request, res: Response) => {
  try {
    const product = await createProduct(req.body);

    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:");
    console.error(error);

    res.status(500).json({
      message: String(error),
    });
  }
};

export const patchProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const data = {
      ...req.body,

      pricePerGram:
        req.body.pricePerGram === "" ||
        req.body.pricePerGram === null ||
        req.body.pricePerGram === undefined
          ? null
          : new Prisma.Decimal(req.body.pricePerGram),

      gramRange: req.body.gramRange === "" ? null : req.body.gramRange,

      price:
        req.body.price === null || req.body.price === undefined
          ? new Prisma.Decimal(0)
          : new Prisma.Decimal(req.body.price),
    };

    const updatedProduct = await updateProduct(id, data);

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update product.",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await deleteProductById(id);

    res.sendStatus(204);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete product.",
    });
  }
};
