import { Router } from "express";

import {
  createNewProduct,
  deleteProduct,
  getProducts,
  getProductGroupController,
  patchProduct,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getProducts);

router.get("/group/:productName", getProductGroupController);

router.post("/", createNewProduct);

// IMPORTANT: This MUST come before "/:id"

router.patch("/:id", patchProduct);

router.delete("/:id", deleteProduct);

export default router;
