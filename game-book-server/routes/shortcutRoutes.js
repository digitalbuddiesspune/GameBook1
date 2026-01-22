import express from 'express';
const router = express.Router();
import * as shortcutController from '../controllers/shortcutController.js';
import { protect } from '../middleware/authMiddleware.js';

// Define a POST route at /api/shortcuts/income
// This matches the URL used in your Shortcut.jsx file's handleSave function
router.post('/income', protect, shortcutController.saveManualIncomes);

// Get all shortcuts for a vendor
router.get('/', protect, shortcutController.getShortcuts);

// Save shortcuts in bulk
router.post('/bulk', protect, shortcutController.saveShortcutsBulk);

export default router;