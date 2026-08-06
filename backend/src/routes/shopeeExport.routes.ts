import { Router } from "express";
import multer from "multer";

import { exportShopeeController } from "../controllers/shopeeExport.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/shopee", upload.array("templates"), exportShopeeController);

export default router;
