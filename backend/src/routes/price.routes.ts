import { Router } from "express";
import {
  applyPricesController,
  previewPricesController,
  getCurrentPricesController,
} from "../controllers/price.controller.js";

const router = Router();

router.get("/current", getCurrentPricesController);

router.post("/preview", previewPricesController);

router.post("/apply", applyPricesController);

export default router;
