import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Marketplace Price Updater API is running 🚀");
});

// Product Routes
app.use("/products", productRoutes);

export default app;
