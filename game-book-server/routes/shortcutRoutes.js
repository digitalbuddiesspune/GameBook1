const express = require('express');
const router = express.Router();
const shortcutController = require('../controllers/shortcutController');
const { protect } = require('../middleware/authMiddleware');

// Define a POST route at /api/shortcuts/income
// This matches the URL used in your Shortcut.jsx file's handleSave function
router.post('/income', protect, shortcutController.saveManualIncomes);

// Get all shortcuts for a vendor
router.get('/', protect, shortcutController.getShortcuts);

// Save shortcuts in bulk
router.post('/bulk', protect, shortcutController.saveShortcutsBulk);

module.exports = router;