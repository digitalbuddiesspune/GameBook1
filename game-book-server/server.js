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
const activityRoutes = require('./routes/activityRoutes');
const shortcutRoutes = require('./routes/shortcutRoutes');

const app = express();

// Enhanced body parsing with size limits and URL-encoded support
app.use(express.json({ limit: '10mb', extended: true }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// CORS configuration
app.use(cors({
  origin: '*', // In production, specify your frontend domain
  credentials: true
}));

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  if (req.path.includes('/api/auth')) {
    console.log('📥 [REQUEST] Method:', req.method);
    console.log('📥 [REQUEST] Path:', req.path);
    console.log('📥 [REQUEST] Original URL:', req.originalUrl);
    console.log('📥 [REQUEST] Base URL:', req.baseUrl);
    console.log('📥 [REQUEST] Headers:', JSON.stringify(req.headers));
    if (req.method === 'POST') {
      console.log('📥 [REQUEST] Body:', JSON.stringify(req.body));
    }
  }
  next();
});

app.get("/", (req, res) => {
  res.send("🚀 Ping successful! The server is alive and responding.");
});

// Use Routes
app.use("/api/auth", validateSystemHealth, authRoutes);
app.use("/api/vendors", validateSystemHealth, vendorRoutes);
app.use("/api/customers", validateSystemHealth, customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/receipts", validateSystemHealth, receiptRoutes);
app.use('/api/activities', validateSystemHealth, activityRoutes);
app.use('/api/shortcuts', validateSystemHealth, shortcutRoutes);

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl || req.path} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const HOST = "0.0.0.0";
const PORT = process.env.PORT || 5000;

// connectDB().then(() => {
//   app.listen(PORT, HOST, () => {
//     console.log(`🚀 Server running on http://${HOST}:${PORT}`);
//   });
// });


connectDB().then(() => {
  app.listen(PORT,() => {
    console.log(`🚀 Server running on ${PORT}`);
  });
});
module.exports = app;