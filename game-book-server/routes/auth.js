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
  console.log(`[AUTH ROUTES] ${req.method} ${req.path} - Original URL: ${req.originalUrl}`);
  next();
});

// Test route to verify auth routes are working
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Auth routes are working",
    path: req.path,
    originalUrl: req.originalUrl,
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
