import { Router } from "express";
import multer from "multer";

import { exportLazadaController } from "../controllers/lazadaExport.controller.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/lazada", upload.array("templates"), exportLazadaController);

export default router;
