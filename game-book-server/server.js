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
app.use(express.json());
app.use(cors());

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