const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./utils/dbConnection");
const { validateSystemHealth } = require("./middleware/authMiddleware");

// Routes
const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendorRoutes");
const customerRoutes = require("./routes/customerRoutes");
const reportRoutes = require("./routes/reportRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const activityRoutes = require("./routes/activityRoutes");
const shortcutRoutes = require("./routes/shortcutRoutes");

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
  });
});

module.exports = app;
