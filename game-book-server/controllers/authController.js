// Filename: controllers/authController.js

const User = require("../models/User");
const Vendor = require("../models/Vendor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    console.log("➡️ [LOGIN] API endpoint hit.");
    console.log("➡️ [LOGIN] Request body:", JSON.stringify(req.body));
    console.log("➡️ [LOGIN] Content-Type:", req.headers['content-type']);
    console.log("➡️ [LOGIN] Path:", req.path);
    console.log("➡️ [LOGIN] Original URL:", req.originalUrl);
    
    const { identifier, password } = req.body; // identifier can be username or mobile

    // Validate that identifier and password are provided
    if (!identifier || !password) {
      console.log("❌ [LOGIN] Missing identifier or password.");
      return res.status(400).json({ 
        success: false,
        message: "Please provide identifier (username or mobile) and password" 
      });
    }

    let user;
    let userType = null;
    console.log("➡️ [LOGIN] Searching for user in database...");

    try {
      // Auto-detect user type: try to find by username first (admin), then by mobile (vendor)
      user = await User.findOne({ username: identifier, role: 'admin' });
      
      if (user) {
        userType = 'admin';
      } else {
        // If not found as admin, try as vendor in Vendor collection
        user = await Vendor.findOne({ mobile: identifier });
        if (user) {
          userType = 'vendor';
        }
      }
    } catch (dbError) {
      console.error("❌ [LOGIN] Database query error:", dbError.message);
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later."
      });
    }

    console.log("➡️ [LOGIN] Database search complete.");

    if (!user) {
      console.log("❌ [LOGIN] User not found.");
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }
    
    // Check vendor approval status
    if (userType === 'vendor' && user.status !== 'approved') {
      console.log(`❌ [LOGIN] Vendor account is ${user.status}.`);
      return res.status(403).json({ 
        success: false,
        message: `Your account is ${user.status}. Please contact admin.`,
        status: user.status
      });
    }
    
    console.log(`✅ [LOGIN] User found with type: ${userType}. Comparing passwords...`);
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ [LOGIN] Password does not match.");
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    console.log("✅ [LOGIN] Password match! Creating JWT...");
    
    // Create JWT payload based on user type
    // Vendor middleware expects { id: vendorId }, admin middleware expects { user: { id, role } }
    const payload = userType === 'vendor' 
      ? { id: user._id.toString() }  // For vendor middleware compatibility
      : { user: { id: user.id || user._id, role: userType } }; // For admin middleware

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        console.log("✅ [LOGIN] Token created. Sending success response.");
        res.status(200).json({
          success: true,
          message: "Login successful!",
          token,
          user: { 
            id: user.id || user._id, 
            username: user.username, 
            mobile: user.mobile,
            businessName: user.businessName,
            role: userType
          }
        });
      }
    );
  } catch (err) {
    console.error("🔥 [LOGIN] A critical error occurred:", err.message);
    console.error("🔥 [LOGIN] Error stack:", err.stack);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};