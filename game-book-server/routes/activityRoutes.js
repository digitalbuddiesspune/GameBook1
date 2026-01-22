import express from 'express';
const router = express.Router();
import { getRecentActivities } from '../controllers/activityController.js';
import { protect } from '../middleware/authMiddleware.js';

// This sets up the GET /api/activities/recent endpoint
// The 'protect' middleware ensures only a logged-in user can access it
router.get('/recent', protect, getRecentActivities);

export default router;