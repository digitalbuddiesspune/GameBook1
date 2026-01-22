import express from "express";
const router = express.Router();

import {
  loginVendor,
  getVendorProfile,
  updateVendorProfile,
  changeVendorPassword,
  getAllVendors,
  addVendorByAdmin,
  updateVendorByAdmin,
  deleteVendorByAdmin,
  updateVendorPasswordByAdmin,
} from "../controllers/vendorController.js";

// Assuming you have middleware to protect routes and check for admin role
import { protect } from "../middleware/authMiddleware.js";


// --- PUBLIC VENDOR ROUTES ---
router.post("/login", loginVendor);


// --- PRIVATE VENDOR ROUTES (for the logged-in vendor themselves) ---
router.route("/me")
  .get(protect, getVendorProfile)
  .put(protect, updateVendorProfile);

router.put("/me/password", protect, changeVendorPassword);


// --- ADMIN-ONLY ROUTES (for managing all vendors) ---
// Note: You would chain your admin-checking middleware here, e.g., .get(protect, admin, getAllVendors)
router.route("/")
  .get(getAllVendors)         // Corresponds to fetchVendors()
  .post(addVendorByAdmin);     // Corresponds to handleAddVendor()

router.route("/:id")
  .put(updateVendorByAdmin)    // Corresponds to handleApprove, handleReject, and saveEdit
  .delete(deleteVendorByAdmin);// Corresponds to handleDelete

router.put("/:id/password", updateVendorPasswordByAdmin); // Corresponds to savePassword


export default router;