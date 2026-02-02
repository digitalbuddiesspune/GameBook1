import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrUpdateDailyGlobalValues,
  getDailyGlobalValues,
  deleteDailyGlobalValues,
} from "../controllers/dailyGlobalValuesController.js";

const router = express.Router();

router.post("/", protect, createOrUpdateDailyGlobalValues);
router.get("/:date", protect, getDailyGlobalValues);
router.delete("/:date", protect, deleteDailyGlobalValues);

export default router;
