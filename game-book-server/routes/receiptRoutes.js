import express from "express";
const router = express.Router();
import { protect } from "../middleware/authMiddleware.js";
import {
    createReceipt,
    getAllReceipts,
    updateReceipt,
    deleteReceipt,
    getDailyTotals
} from "../controllers/receiptController.js";

// Matches GET request to /api/receipts/daily-totals to get daily totals by company
router.get("/daily-totals", protect, getDailyTotals);

// Matches GET request to /api/receipts to get all receipts
router.get("/", protect, getAllReceipts);

// Matches POST request to /api/receipts to create a new receipt
router.post("/", protect, createReceipt);

// Matches PUT request to /api/receipts/:id to update a specific receipt
router.put("/:id", protect, updateReceipt);

// Matches DELETE request to /api/receipts/:id to delete a specific receipt
router.delete("/:id", protect, deleteReceipt);

export default router;
