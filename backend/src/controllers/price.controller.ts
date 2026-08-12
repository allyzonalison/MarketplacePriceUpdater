import { Request, Response } from "express";

import {
  previewGroupPrice,
  applyGroupPrice,
  getCurrentPrices,
} from "../services/pricing.service.js";

export const applyPricesController = async (req: Request, res: Response) => {
  try {
    console.log("===== APPLY PRICE REQUEST =====");
    console.log(req.body);

    const { group, supplier, pricePerGram } = req.body;

    const result = await applyGroupPrice({
      group,
      supplier,
      pricePerGram,
    });

    res.status(202).json({
      message: "Price update started.",
      total: result.total,
    });
  } catch (error) {
    console.error("===== APPLY PRICE ERROR =====");
    console.error(error);

    res.status(500).json({
      message: "Failed to start price update.",
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

export const getCurrentPricesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const prices = await getCurrentPrices();

    res.json(prices);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to load current prices.",
    });
  }
};
