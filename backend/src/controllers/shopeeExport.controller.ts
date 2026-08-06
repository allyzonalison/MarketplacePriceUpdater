import type { Request, Response } from "express";
import JSZip from "jszip";

import { exportShopee } from "../services/shopeeExport.service.js";

export const exportShopeeController = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "No Excel files uploaded.",
      });
    }

    const zip = new JSZip();

    for (const file of files) {
      const updatedWorkbook = await exportShopee(file.buffer);

      zip.file(file.originalname, updatedWorkbook);
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 9,
      },
    });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Shopee_Updated.zip"'
    );

    res.send(zipBuffer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate Shopee export.",
    });
  }
};
