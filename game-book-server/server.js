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
  if (req.path === '/api/auth/login') {
    console.log('📥 [REQUEST] Method:', req.method);
    console.log('📥 [REQUEST] Path:', req.path);
    console.log('📥 [REQUEST] Headers:', JSON.stringify(req.headers));
    console.log('📥 [REQUEST] Body:', JSON.stringify(req.body));
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