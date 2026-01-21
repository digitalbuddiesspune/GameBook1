const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

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
    originalUrl: req.originalUrl
  });
});

router.post("/login", login);

module.exports = router;
