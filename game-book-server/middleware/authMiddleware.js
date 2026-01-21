const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");
const { SysHealth } = require("../models/Counter");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.vendor = await Vendor.findById(decoded.id).select("-password");

      if (!req.vendor) {
        return res.status(401).json({ message: "Not authorized, vendor not found" });
      }

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const validateSystemHealth = async (req, res, next) => {
  try {
    // Skip system health check for login route to ensure it's always accessible
    if (req.path === '/login' || req.path === '/api/auth/login') {
      return next();
    }

    let sysHealth = await SysHealth.findOne();
    
    if (!sysHealth) {
      sysHealth = await SysHealth.create({ isEnabled: true });
    }

    if (!sysHealth.isEnabled) {
      return res.status(503).json({
        success: false,
        message: sysHealth.reason || "App is currently under maintenance. Please try again later."
      });
    }

    next();
  } catch (error) {
    console.error("System health validation error:", error);
    // Always call next() even on error to prevent blocking routes
    next();
  }
};

module.exports = { protect, validateSystemHealth };

