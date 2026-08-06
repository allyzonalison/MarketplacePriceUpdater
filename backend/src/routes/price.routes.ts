import { Router } from "express";
import {
  applyPricesController,
  previewPricesController,
} from "../controllers/price.controller.js";

const router = Router();

router.post("/preview", previewPricesController);

router.post("/apply", applyPricesController);

export default router;
