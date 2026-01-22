const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

// Verify login function is available
if (!login) {
  console.error("❌ [AUTH ROUTES] Login function not found in authController!");
} else {
  console.log("✅ [AUTH ROUTES] Login function loaded successfully");
}

// Log all requests to auth routes for debugging
router.use((req, res, next) => {
  console.log(`[AUTH ROUTES] ========================================`);
  console.log(`[AUTH ROUTES] Method: ${req.method}`);
  console.log(`[AUTH ROUTES] Path: ${req.path}`);
  console.log(`[AUTH ROUTES] Original URL: ${req.originalUrl}`);
  console.log(`[AUTH ROUTES] Base URL: ${req.baseUrl}`);
  console.log(`[AUTH ROUTES] Route stack length: ${router.stack?.length || 0}`);
  console.log(`[AUTH ROUTES] ========================================`);
  next();
});

// Test route to verify auth routes are working
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Auth routes are working",
    path: req.path,
    originalUrl: req.originalUrl,
    timestamp: new Date().toISOString(),
    version: "2.0",
    handler: "NEW_LOGIN_HANDLER_V2"
  });
});

// Version check endpoint
router.get("/version", (req, res) => {
  const { login } = require("../controllers/authController");
  res.json({
    success: true,
    version: "2.0",
    handler: "NEW_LOGIN_HANDLER_V2",
    loginFunctionExists: !!login,
    message: "If you see version 2.0, new code is running. Old code would not have this endpoint.",
    timestamp: new Date().toISOString()
  });
});

// Login route
if (login) {
  router.post("/login", login);
  console.log("✅ [AUTH ROUTES] POST /login route registered");
} else {
  router.post("/login", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Login handler not available. Please check server logs."
    });
  });
  console.error("❌ [AUTH ROUTES] Login route registered with error handler");
}

module.exports = router;
