import { Router } from "express";
import multer from "multer";

import { exportTikTokController } from "../controllers/tiktokExport.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/tiktok", upload.array("templates"), exportTikTokController);

export default router;
