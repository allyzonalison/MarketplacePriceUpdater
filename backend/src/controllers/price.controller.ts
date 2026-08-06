import { Request, Response } from "express";
import {
  applyGroupPrice,
  previewGroupPrice,
} from "../services/pricing.service.js";

export const applyPricesController = async (req: Request, res: Response) => {
  try {
    const { group, supplier, pricePerGram } = req.body;

    await applyGroupPrice({
      group,
      supplier,
      pricePerGram,
    });

    res.json({
      message: "Prices updated successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update prices.",
    });
  }
};

export const previewPricesController = async (req: Request, res: Response) => {
  try {
    const { group, supplier, pricePerGram } = req.body;

    const preview = await previewGroupPrice({
      group,
      supplier,
      pricePerGram,
    });

    res.json(preview);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to preview prices.",
    });
  }
};
