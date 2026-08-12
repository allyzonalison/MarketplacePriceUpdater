import type { Request, Response } from "express";
import JSZip from "jszip";

import { exportShopee } from "../services/shopeeExport.service.js";

export const exportShopeeController = async (req: Request, res: Response) => {
  try {
    console.log("===== Shopee Export Started =====");

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      console.log("❌ No files uploaded.");

      return res.status(400).json({
        message: "No Excel files uploaded.",
      });
    }

    console.log(`📄 Received ${files.length} file(s).`);

    const zip = new JSZip();

    for (const file of files) {
      console.log(`➡️ Processing ${file.originalname}`);

      const updatedWorkbook = await exportShopee(file.buffer);

      console.log(`✅ Finished ${file.originalname}`);

      zip.file(file.originalname, updatedWorkbook);
    }

    console.log("📦 Generating ZIP...");

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: {
        level: 3,
      },
    });

    console.log("✅ ZIP generated.");

    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Shopee_Updated.zip"'
    );

    console.log("⬆️ Sending ZIP...");

    res.send(zipBuffer);

    console.log("🎉 Export completed.");
  } catch (error) {
    console.error("❌ EXPORT ERROR:");
    console.error(error);

    res.status(500).json({
      message: "Failed to generate Shopee export.",
    });
  }
};
