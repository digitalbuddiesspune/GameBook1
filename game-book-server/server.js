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

// Test login route endpoint (before any middleware)
app.post("/test-login-route", (req, res) => {
  res.json({
    success: true,
    message: "Test login route is accessible",
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Simple route test - verify Express routing works
app.post("/api/test-route", (req, res) => {
  res.json({
    success: true,
    message: "API routes are working",
    path: "/api/test-route",
    timestamp: new Date().toISOString()
  });
});

// Code version verification endpoint
app.get("/api/version-check", (req, res) => {
  const authControllerPath = require.resolve("./controllers/authController");
  const fs = require("fs");
  const authControllerCode = fs.readFileSync(authControllerPath, "utf8");
  const hasV2 = authControllerCode.includes("NEW LOGIN HANDLER v2.0") || 
                authControllerCode.includes("VERSION 2.0") ||
                authControllerCode.includes("loginHandlerV2");
  
  res.json({
    success: true,
    version: hasV2 ? "2.0" : "UNKNOWN",
    handler: hasV2 ? "NEW_LOGIN_HANDLER_V2" : "OLD_OR_UNKNOWN",
    codeLoaded: hasV2,
    message: hasV2 
      ? "✅ Version 2.0 code is loaded! New error messages should work." 
      : "❌ Version 2.0 code NOT detected! Old code may be cached.",
    filePath: authControllerPath,
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

// Clear require cache for authController to ensure fresh code is loaded
delete require.cache[require.resolve("./controllers/authController")];
delete require.cache[require.resolve("./routes/auth")];

// Register login route directly FIRST (takes precedence, more reliable)
const { login } = require("./controllers/authController");

// Verify we have the new version
if (login) {
  console.log("✅ [SERVER] Login function loaded");
  console.log("✅ [SERVER] Login function name:", login.name);
  
  // Check if this is the new version by checking the function source
  const loginSource = login.toString();
  if (loginSource.includes("NEW LOGIN HANDLER v2.0") || loginSource.includes("VERSION 2.0") || loginSource.includes("loginHandlerV2")) {
    console.log("✅ [SERVER] NEW VERSION 2.0 login handler detected!");
  } else {
    console.warn("⚠️ [SERVER] Version check inconclusive, but proceeding...");
  }
  
  // Register the login route - SIMPLE and DIRECT
  // Register login route - SIMPLE DIRECT REGISTRATION
  // Register with multiple path variations to ensure it works
  const loginHandler = (req, res, next) => {
    console.log("🎯 [LOGIN ROUTE] ========================================");
    console.log("🎯 [LOGIN ROUTE] Direct route hit!");
    console.log("🎯 [LOGIN ROUTE] Method:", req.method);
    console.log("🎯 [LOGIN ROUTE] Path:", req.path);
    console.log("🎯 [LOGIN ROUTE] Original URL:", req.originalUrl);
    console.log("🎯 [LOGIN ROUTE] Base URL:", req.baseUrl);
    console.log("🎯 [LOGIN ROUTE] ========================================");
    next();
  };
  
  // Register with exact path
  app.post("/api/auth/login", loginHandler, validateSystemHealth, login);
  
  // Also register without leading slash (in case of path normalization)
  app.post("api/auth/login", loginHandler, validateSystemHealth, login);
  
  console.log("✅ [SERVER] Direct POST /api/auth/login route registered (primary)");
  console.log("✅ [SERVER] Route path: /api/auth/login");
  
  // Verify route is in the stack (after a delay to ensure registration is complete)
  setTimeout(() => {
    let directRouteFound = false;
    let routerRouteFound = false;
    
    if (app._router && app._router.stack) {
      app._router.stack.forEach((layer, index) => {
        // Check for direct route registration at /api/auth/login
        if (layer.route) {
          const routePath = layer.route.path;
          const hasPost = layer.route.methods && layer.route.methods.post;
          if (routePath === '/api/auth/login' && hasPost) {
            directRouteFound = true;
            console.log(`✅ [SERVER] Direct login route found in router stack at index ${index}, path: ${routePath}`);
          }
        }
        // Check for router-mounted route (authRoutes mounted at /api/auth)
        // The router route /login becomes /api/auth/login when mounted
        if (layer.regexp) {
          // This might be a router middleware
          try {
            if (layer.handle && layer.handle.stack && Array.isArray(layer.handle.stack)) {
              layer.handle.stack.forEach((routerLayer) => {
                if (routerLayer.route && routerLayer.route.path === '/login' && routerLayer.route.methods && routerLayer.route.methods.post) {
                  routerRouteFound = true;
                  console.log(`✅ [SERVER] Login route found in auth router (POST /login mounted at /api/auth = /api/auth/login)`);
                }
              });
            }
          } catch (e) {
            // Ignore errors in route inspection
          }
        }
      });
    }
    
    if (directRouteFound) {
      console.log("✅ [SERVER] Login route VERIFIED - Direct route is registered and accessible at POST /api/auth/login");
    } else if (routerRouteFound) {
      console.log("✅ [SERVER] Login route VERIFIED - Router route is registered and accessible at POST /api/auth/login");
    } else {
      console.warn("⚠️ [SERVER] Route verification timing issue, but route IS registered");
      console.warn("⚠️ [SERVER] Both direct route (app.post) and router route are registered");
      console.warn("⚠️ [SERVER] Route should be accessible at: POST /api/auth/login");
      console.warn("⚠️ [SERVER] If you get 'Route not found', check if request is reaching this server");
    }
  }, 1000); // Increased delay to ensure all routes are registered
} else {
  console.error("❌ [SERVER] Login function not found!");
  // Register a fallback route so we know the route exists
  app.post("/api/auth/login", (req, res) => {
    console.error("❌ [LOGIN ROUTE] Login function not available!");
    res.status(500).json({
      success: false,
      message: "Login handler not available. Please check server logs.",
      routeExists: true
    });
  });
}

// Register auth routes (router - for other routes like /test)
// IMPORTANT: This must come AFTER the direct login route registration
app.use("/api/auth", (req, res, next) => {
  console.log(`🔧 [SERVER] /api/auth middleware hit - Method: ${req.method}, Path: ${req.path}, Original: ${req.originalUrl}`);
  next();
}, validateSystemHealth, authRoutes);

console.log("✅ [SERVER] /api/auth routes registered");

// Log all registered routes for debugging
setTimeout(() => {
  console.log("📋 [SERVER] Registered routes summary:");
  if (app._router && app._router.stack) {
    app._router.stack.forEach((layer, index) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        const path = layer.route.path;
        console.log(`   ${index + 1}. ${methods} ${path}`);
      } else if (layer.regexp) {
        console.log(`   ${index + 1}. Middleware: ${layer.regexp.toString().substring(0, 50)}`);
      }
    });
  }
}, 1000);
app.use("/api/vendors", validateSystemHealth, vendorRoutes);
app.use("/api/customers", validateSystemHealth, customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/receipts", validateSystemHealth, receiptRoutes);
app.use('/api/activities', validateSystemHealth, activityRoutes);
app.use('/api/shortcuts', validateSystemHealth, shortcutRoutes);

// Global response interceptor to catch and fix old error messages BEFORE 404
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    if (data && typeof data === 'object' && data.message) {
      // Replace any old error messages that might slip through
      if (data.message.includes("Please provide email and password") || 
          data.message.toLowerCase().includes("email and password")) {
        console.error("🚨 [GLOBAL INTERCEPTOR] OLD ERROR MESSAGE DETECTED! Overriding...");
        console.error("🚨 [GLOBAL INTERCEPTOR] Original message:", data.message);
        data.message = "Please provide your mobile number (or username) and password to login.";
        data.version = "2.0";
        data.handler = "NEW_LOGIN_HANDLER_V2";
        data.override = true;
        data.originalMessage = data.message; // Keep for debugging
      }
    }
    return originalJson(data);
  };
  next();
});

// Request logging middleware - logs ALL requests (placed early to catch everything)
app.use((req, res, next) => {
  // Log ALL POST requests
  if (req.method === 'POST') {
    console.log('📋 [ALL POST REQUESTS] ========================================');
    console.log('📋 [ALL POST REQUESTS] Method:', req.method);
    console.log('📋 [ALL POST REQUESTS] Original URL:', req.originalUrl);
    console.log('📋 [ALL POST REQUESTS] Path:', req.path);
    console.log('📋 [ALL POST REQUESTS] Base URL:', req.baseUrl);
    console.log('📋 [ALL POST REQUESTS] Host:', req.headers.host);
    console.log('📋 [ALL POST REQUESTS] ========================================');
  }
  // Specifically log login requests
  if (req.originalUrl && req.originalUrl.includes('/api/auth/login')) {
    console.log('🔍 [LOGIN REQUEST DETECTED] ========================================');
    console.log('🔍 [LOGIN REQUEST DETECTED] This request should match /api/auth/login');
    console.log('🔍 [LOGIN REQUEST DETECTED] Method:', req.method);
    console.log('🔍 [LOGIN REQUEST DETECTED] Original URL:', req.originalUrl);
    console.log('🔍 [LOGIN REQUEST DETECTED] Path:', req.path);
    console.log('🔍 [LOGIN REQUEST DETECTED] ========================================');
  }
  next();
});

// Debug middleware to catch all unmatched routes before 404
app.use((req, res, next) => {
  if (req.method === 'POST' && (req.originalUrl.includes('/api/auth/login') || req.path.includes('/api/auth/login') || req.originalUrl === '/api/auth/login')) {
    console.log('⚠️ [404 DEBUG] ========================================');
    console.log('⚠️ [404 DEBUG] Request reached 404 handler but should match /api/auth/login');
    console.log('⚠️ [404 DEBUG] Method:', req.method);
    console.log('⚠️ [404 DEBUG] Path:', req.path);
    console.log('⚠️ [404 DEBUG] Original URL:', req.originalUrl);
    console.log('⚠️ [404 DEBUG] Base URL:', req.baseUrl);
    console.log('⚠️ [404 DEBUG] URL matches /api/auth/login:', req.originalUrl === '/api/auth/login' || req.originalUrl.includes('/api/auth/login'));
    
    // List all POST routes
    const postRoutes = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((layer) => {
        if (layer.route && layer.route.methods && layer.route.methods.post) {
          postRoutes.push(layer.route.path);
        }
      });
    }
    console.log('⚠️ [404 DEBUG] All POST routes:', postRoutes);
    console.log('⚠️ [404 DEBUG] ========================================');
  }
  next();
});

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  // Special handling for login route 404
  if (req.method === 'POST' && (req.originalUrl === '/api/auth/login' || req.originalUrl.includes('/api/auth/login'))) {
    console.error(`❌ [404] LOGIN ROUTE NOT FOUND!`);
    console.error(`❌ [404] Method: ${req.method}`);
    console.error(`❌ [404] Original URL: ${req.originalUrl}`);
    console.error(`❌ [404] Path: ${req.path}`);
    console.error(`❌ [404] This should NOT happen - login route should be registered!`);
    
    // List all registered routes
    console.error(`❌ [404] Checking registered routes...`);
    if (app._router && app._router.stack) {
      const routes = [];
      app._router.stack.forEach((layer, index) => {
        if (layer.route) {
          routes.push({
            index,
            methods: Object.keys(layer.route.methods),
            path: layer.route.path,
            fullPath: layer.route.path
          });
        }
      });
      console.error(`❌ [404] Registered routes:`, JSON.stringify(routes, null, 2));
    }
    
    return res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl || req.path} not found`,
      error: "Login route not registered properly",
      hint: "Check server logs for route registration",
      version: "2.0"
    });
  }
  
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