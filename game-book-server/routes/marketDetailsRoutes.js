import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrUpdateMarketDetails,
  getMarketDetails,
  getCustomerMarketDetails,
  getMarketDetailsByDate,
  deleteMarketDetails,
  deleteMarketDetailsByParams,
  clearMarketDetailsByDate,
} from "../controllers/marketDetailsController.js";

// Create or update market details
router.post("/", protect, createOrUpdateMarketDetails);

// Get market details for specific customer, market, and date
router.get("/:customerId/:companyName/:date", protect, getMarketDetails);

// Get all market details for a customer (optionally filtered by date)
router.get("/customer/:customerId", protect, getCustomerMarketDetails);

// Get all market details for a specific date
router.get("/date/:date", protect, getMarketDetailsByDate);

// Delete market details by ID
router.delete("/:id", protect, deleteMarketDetails);

// Delete market details by customer, market, and date
router.delete("/", protect, deleteMarketDetailsByParams);

// Clear all market details for a specific date
router.delete("/date/:date", protect, clearMarketDetailsByDate);

export default router;
