const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// This sets up the GET /api/activities/recent endpoint
// The 'protect' middleware ensures only a logged-in user can access it
router.get('/recent', protect, getRecentActivities);

module.exports = router;