import type { Request, Response } from "express";
import { exportTikTok } from "../services/tiktokExport.service.js";

export const exportTikTokController = async (req: Request, res: Response) => {
  try {
    console.log("===== TikTok Export Started =====");

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      console.log("❌ No TikTok Excel file uploaded.");

      return res.status(400).json({
        message: "No Excel file uploaded.",
      });
    }

    // TikTok accepts ONE exported Excel file.
    const file = files[0];

    console.log(`📄 Received: ${file.originalname}`);

    const updatedWorkbook = await exportTikTok(file.buffer);

    console.log(`✅ Finished processing: ${file.originalname}`);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="TikTok_Updated.xlsx"`
    );

    console.log("⬆️ Sending updated TikTok Excel...");

    res.send(updatedWorkbook);

    console.log("🎉 TikTok export completed.");
  } catch (error) {
    console.error("❌ TIKTOK EXPORT ERROR:");
    console.error(error);

    res.status(500).json({
      message: "Failed to generate TikTok export.",
    });
  }
};
