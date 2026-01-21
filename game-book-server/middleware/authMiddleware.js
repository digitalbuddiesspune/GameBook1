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
    // Skip system health check for login and test routes to ensure they're always accessible
    const path = req.path || req.originalUrl || '';
    if (path.includes('/login') || path.includes('/test') || path === '/') {
      return next();
    }

    // Try to check system health, but don't block if database is not ready
    try {
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
    } catch (dbError) {
      // If database query fails, log but don't block the request
      console.warn("System health check failed (database may not be ready):", dbError.message);
      // Continue to next middleware - don't block routes if DB check fails
    }

    next();
  } catch (error) {
    console.error("System health validation error:", error);
    // Always call next() even on error to prevent blocking routes
    next();
  }
};

module.exports = { protect, validateSystemHealth };

