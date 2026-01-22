import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Vendor from "../models/Vendor.js";

// --- UNCHANGED FUNCTIONS ---

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Login Vendor
const loginVendor = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const vendor = await Vendor.findOne({ mobile });
    if (!vendor) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const vendorData = vendor.toObject();
    delete vendorData.password;
    res.json({
      message: "Login successful",
      vendor: vendorData,
      token: generateToken(vendor._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get/Update a specific vendor's own profile (when they are logged in)
const getVendorProfile = async (req, res) => {
  if (req.vendor) {
    const vendorData = req.vendor.toObject();
    delete vendorData.password;
    res.json({ vendor: vendorData });
  } else {
    res.status(404).json({ message: "Vendor not found" });
  }
};
const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendor._id);
    if (vendor) {
      vendor.businessName = req.body.businessName || vendor.businessName;
      vendor.name = req.body.name || vendor.name;
      vendor.email = req.body.email || vendor.email;
      vendor.mobile = req.body.mobile || vendor.mobile;
      vendor.address = req.body.address || vendor.address;
      const updatedVendor = await vendor.save();
      const vendorData = updatedVendor.toObject();
      delete vendorData.password;
      res.json({
        message: "Profile updated successfully",
        vendor: vendorData,
      });
    } else {
      res.status(404).json({ message: "Vendor not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Change vendor's own password
 * @route   PUT /api/vendors/me/password
 * @access  Private (Vendor)
 */
const changeVendorPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const vendor = await Vendor.findById(req.vendor._id);
    
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, vendor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    vendor.password = await bcrypt.hash(newPassword, salt);
    
    await vendor.save();
    
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// --- UPDATED & NEW FUNCTIONS FOR ADMIN DASHBOARD ---

/**
 * @desc    Get all vendors
 * @route   GET /api/vendors
 * @access  Private (Admin)
 */
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({}).select("-password"); // Exclude passwords
    res.status(200).json(vendors);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    Add a new vendor (used by Admin)
 * @route   POST /api/vendors
 * @access  Private (Admin)
 */
const addVendorByAdmin = async (req, res) => {
  try {
    const { businessName, name, email, mobile, password, address } = req.body;
    const vendorExists = await Vendor.findOne({ mobile });
    if (vendorExists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const vendor = await Vendor.create({
      businessName,
      name,
      email,
      mobile,
      password: hashedPassword,
      address,
      // Status defaults to 'pending' from the schema
    });

    if (vendor) {
      const vendorData = vendor.toObject();
      delete vendorData.password;
      res.status(201).json({
        message: "Vendor added successfully",
        vendor: vendorData,
      });
    } else {
      res.status(400).json({ message: "Invalid vendor data" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Update a vendor's details or status (used by Admin)
 * @route   PUT /api/vendors/:id
 * @access  Private (Admin)
 */
const updateVendorByAdmin = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update fields from request body
    Object.assign(vendor, req.body);

    const updatedVendor = await vendor.save();
    const vendorData = updatedVendor.toObject();
    delete vendorData.password;

    res.json(vendorData);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    Delete a vendor (used by Admin)
 * @route   DELETE /api/vendors/:id
 * @access  Private (Admin)
 */
const deleteVendorByAdmin = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    await vendor.deleteOne(); // Use deleteOne() instead of remove()
    res.json({ message: "Vendor removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc    Update a vendor's password (used by Admin)
 * @route   PUT /api/vendors/:id/password
 * @access  Private (Admin)
 */
const updateVendorPasswordByAdmin = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    const salt = await bcrypt.genSalt(10);
    vendor.password = await bcrypt.hash(password, salt);
    await vendor.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


export {
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
  getAllVendors,
  addVendorByAdmin,
  updateVendorByAdmin,
  deleteVendorByAdmin,
  updateVendorPasswordByAdmin,
};