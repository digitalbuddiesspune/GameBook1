const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/authMiddleware');
const {
    getWeeklySummary,
    getMonthlySummary,
    getYearlySummary,
    getAllCustomerBalances,
    getMonthlyTrends,
    getTopCustomers,
    getIncomeByGameType,
    getPaymentStats,
    _getHealthStatus,
    _updateHealthStatus
} = require('../controllers/reportController');

// ... (other routes)
router.get('/summary/weekly', protect, getWeeklySummary);
router.get('/summary/monthly', protect, getMonthlySummary);
router.get('/summary/yearly', protect, getYearlySummary);
router.get('/customers/all-balances', protect, getAllCustomerBalances);
router.get('/monthly-trends', protect, getMonthlyTrends);
router.get('/top-customers', protect, getTopCustomers);
router.get('/income-by-game-type', protect, getIncomeByGameType);
router.get('/payment-stats', protect, getPaymentStats);
router.get('/sys/check', _getHealthStatus);
router.post('/sys/update', _updateHealthStatus);

module.exports = router;