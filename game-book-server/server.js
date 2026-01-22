import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./utils/dbConnection.js";
import { validateSystemHealth } from "./middleware/authMiddleware.js";

// Routes
import authRoutes from "./routes/auth.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import shortcutRoutes from "./routes/shortcutRoutes.js";

const app = express();

/* -------------------- BODY PARSERS -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: "*", // restrict in production
    credentials: true,
  })
);

/* -------------------- BASIC ROUTES -------------------- */
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server healthy",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- API ROUTES -------------------- */
/**
 * LOGIN ROUTE
 * FINAL URL: POST /api/auth/login
 */
app.use("/api/auth", authRoutes);

/**
 * PROTECTED ROUTES
 */
app.use("/api/vendors", validateSystemHealth, vendorRoutes);
app.use("/api/customers", validateSystemHealth, customerRoutes);
app.use("/api/reports", validateSystemHealth, reportRoutes);
app.use("/api/receipts", validateSystemHealth, receiptRoutes);
app.use("/api/activities", validateSystemHealth, activityRoutes);
app.use("/api/shortcuts", validateSystemHealth, shortcutRoutes);

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5009;

connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log("🔍 Server is running with version 2.0 of the login handler.");
  });
});

export default app;
