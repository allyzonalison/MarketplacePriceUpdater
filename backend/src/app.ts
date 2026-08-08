import express from "express";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import priceRoutes from "./routes/price.routes.js";
import shopeeExportRoutes from "./routes/shopeeExport.routes.js";

import authRoutes from "./routes/auth.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Temporary logger (for debugging)
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test Route
app.get("/", (_req, res) => {
  res.send("Marketplace Price Updater API is running 🚀");
});

// Routes
app.use("/products", productRoutes);
app.use("/prices", priceRoutes);
app.use("/exports", shopeeExportRoutes);

app.use("/auth", authRoutes);

export default app;
