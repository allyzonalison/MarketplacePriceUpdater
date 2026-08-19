import type { Request, Response } from "express";
import { exportLazada } from "../services/lazadaExport.service.js";

export const exportLazadaController = async (req: Request, res: Response) => {
  try {
    console.log("===== Lazada Export Started =====");

    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      console.log("❌ No Lazada Excel file uploaded.");

      return res.status(400).json({
        message: "No Excel file uploaded.",
      });
    }

    // For now, Lazada accepts ONE exported Excel file.
    const file = files[0];

    console.log(`📄 Received: ${file.originalname}`);

    const updatedWorkbook = await exportLazada(file.buffer);

    console.log(`✅ Finished processing: ${file.originalname}`);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Lazada_Updated.xlsx"`
    );

    console.log("⬆️ Sending updated Lazada Excel...");

    res.send(updatedWorkbook);

    console.log("🎉 Lazada export completed.");
  } catch (error) {
    console.error("❌ LAZADA EXPORT ERROR:");
    console.error(error);

    res.status(500).json({
      message: "Failed to generate Lazada export.",
    });
  }
};
