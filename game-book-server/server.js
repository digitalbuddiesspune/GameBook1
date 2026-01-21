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
// Add error handler for JSON parsing errors
app.use(express.json({ 
  limit: '10mb', 
  extended: true,
  strict: false // Allow non-strict JSON
}));

app.use(express.urlencoded({ 
  limit: '10mb', 
  extended: true 
}));

// Handle JSON parsing errors (must be after body parsers)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ [BODY PARSER] JSON parsing error:', err.message);
    console.error('❌ [BODY PARSER] Error stack:', err.stack);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body. Please ensure your request body is valid JSON.',
      error: err.message
    });
  }
  next();
});

// CORS configuration
app.use(cors({
  origin: '*', // In production, specify your frontend domain
  credentials: true
}));

// Debugging middleware to log incoming requests
app.use((req, res, next) => {
  if (req.path.includes('/api/auth') || req.originalUrl.includes('/api/auth')) {
    console.log('📥 [REQUEST] ========================================');
    console.log('📥 [REQUEST] Method:', req.method);
    console.log('📥 [REQUEST] Path:', req.path);
    console.log('📥 [REQUEST] Original URL:', req.originalUrl);
    console.log('📥 [REQUEST] Base URL:', req.baseUrl);
    console.log('📥 [REQUEST] Content-Type:', req.headers['content-type']);
    console.log('📥 [REQUEST] Body Type:', typeof req.body);
    console.log('📥 [REQUEST] Body Keys:', req.body ? Object.keys(req.body) : 'No body');
    if (req.method === 'POST' && req.body) {
      console.log('📥 [REQUEST] Full Body:', JSON.stringify(req.body, null, 2));
    }
    console.log('📥 [REQUEST] ========================================');
  }
  next();
});

app.get("/", (req, res) => {
  res.send("🚀 Ping successful! The server is alive and responding.");
});

// Health check endpoint (no middleware, always accessible)
app.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Server is healthy",
    timestamp: new Date().toISOString()
  });
});

// Verify auth routes are loaded
console.log("✅ Auth routes loaded:", authRoutes ? "Yes" : "No");
if (authRoutes && authRoutes.stack) {
  try {
    const routesInfo = authRoutes.stack.map(r => {
      const methods = r.route?.methods ? Object.keys(r.route.methods).join(', ').toUpperCase() : 'ALL';
      const path = r.route?.path || (r.regexp ? r.regexp.toString() : 'unknown');
      return `${methods} ${path}`;
    });
    console.log("✅ Auth routes stack:", routesInfo);
  } catch (err) {
    console.log("✅ Auth routes stack: (unable to parse)", err.message);
  }
}

// Use Routes - Login route should be accessible even if system health check fails
console.log("🔧 [SERVER] Registering /api/auth routes...");

// Register auth routes
app.use("/api/auth", (req, res, next) => {
  console.log(`🔧 [SERVER] /api/auth middleware hit - Method: ${req.method}, Path: ${req.path}, Original: ${req.originalUrl}`);
  next();
}, validateSystemHealth, authRoutes);

// Also register login route directly as a fallback (in case router doesn't work)
const { login } = require("./controllers/authController");
if (login) {
  app.post("/api/auth/login", validateSystemHealth, login);
  console.log("✅ [SERVER] Direct POST /api/auth/login route registered as fallback");
}

console.log("✅ [SERVER] /api/auth routes registered");
app.use("/api/vendors", validateSystemHealth, vendorRoutes);
app.use("/api/customers", validateSystemHealth, customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/receipts", validateSystemHealth, receiptRoutes);
app.use('/api/activities', validateSystemHealth, activityRoutes);
app.use('/api/shortcuts', validateSystemHealth, shortcutRoutes);

// Debug middleware to catch all unmatched routes before 404
app.use((req, res, next) => {
  if (req.originalUrl.includes('/api/auth/login') || req.path.includes('/api/auth/login')) {
    console.log('⚠️ [404 DEBUG] Request reached 404 handler but should match /api/auth/login');
    console.log('⚠️ [404 DEBUG] Method:', req.method);
    console.log('⚠️ [404 DEBUG] Path:', req.path);
    console.log('⚠️ [404 DEBUG] Original URL:', req.originalUrl);
    console.log('⚠️ [404 DEBUG] Base URL:', req.baseUrl);
    console.log('⚠️ [404 DEBUG] Registered routes:', app._router?.stack?.map(layer => {
      if (layer.route) {
        return `${Object.keys(layer.route.methods).join(', ').toUpperCase()} ${layer.route.path}`;
      }
      return 'Middleware';
    }));
  }
  next();
});

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  console.log(`❌ [404] Route not found: ${req.method} ${req.originalUrl || req.path}`);
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