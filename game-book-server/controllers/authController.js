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
    
    // Support both 'identifier' and 'email' for backward compatibility
    // Also support 'mobile' as an alternative
    const identifier = req.body.identifier || req.body.email || req.body.mobile || req.body.username;
    const password = req.body.password;

    // Validate that identifier and password are provided
    if (!identifier || !password) {
      console.log("❌ [LOGIN] Missing identifier/email/mobile or password.");
      console.log("❌ [LOGIN] Received body keys:", Object.keys(req.body));
      return res.status(400).json({ 
        success: false,
        message: "Please provide identifier (username or mobile) and password" 
      });
    }

    // Trim whitespace from identifier
    const cleanIdentifier = String(identifier).trim();
    const cleanPassword = String(password).trim();

    if (!cleanIdentifier || !cleanPassword) {
      console.log("❌ [LOGIN] Empty identifier or password after trimming.");
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
      user = await User.findOne({ username: cleanIdentifier, role: 'admin' });
      
      if (user) {
        userType = 'admin';
        console.log("✅ [LOGIN] Found admin user with username:", cleanIdentifier);
      } else {
        // If not found as admin, try as vendor in Vendor collection
        // Try exact match first
        user = await Vendor.findOne({ mobile: cleanIdentifier });
        
        // If not found, try with different formats (remove spaces, dashes, etc.)
        if (!user) {
          const normalizedMobile = cleanIdentifier.replace(/[\s\-\(\)]/g, '');
          user = await Vendor.findOne({ 
            $or: [
              { mobile: cleanIdentifier },
              { mobile: normalizedMobile }
            ]
          });
        }
        
        if (user) {
          userType = 'vendor';
          console.log("✅ [LOGIN] Found vendor user with mobile:", cleanIdentifier);
        }
      }
    } catch (dbError) {
      console.error("❌ [LOGIN] Database query error:", dbError.message);
      console.error("❌ [LOGIN] Database error stack:", dbError.stack);
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later."
      });
    }

    console.log("➡️ [LOGIN] Database search complete.");

    if (!user) {
      console.log("❌ [LOGIN] User not found for identifier:", cleanIdentifier);
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
    
    // Check if user has a password hash
    if (!user.password) {
      console.log("❌ [LOGIN] User has no password hash.");
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }
    
    const isMatch = await bcrypt.compare(cleanPassword, user.password);

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