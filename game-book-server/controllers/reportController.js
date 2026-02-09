import Receipt from '../models/Receipt.js';
import Customer from '../models/Customer.js';
import { SysHealth } from '../models/Counter.js';
import moment from 'moment';
import mongoose from 'mongoose';

/**
 * A helper function to calculate both total income and total profit for a given period.
 * Profit is calculated as (totalIncome - totalPayment).
 * @param {Date} startDate - The start of the date range.
 * @param {Date} endDate - The end of the date range.
 * @param {String} vendorId - The ID of the logged-in vendor to scope the query.
 * @returns {Object} An object containing totalIncome and totalProfit.
 */
const calculateSummary = async (startDate, endDate, vendorId) => {
    console.log('Calculate Summary - Vendor ID:', vendorId);
    console.log('Date Range:', startDate.toDate(), 'to', endDate.toDate());
    
    const result = await Receipt.aggregate([
        {
            $match: {
                vendorId: new mongoose.Types.ObjectId(vendorId),
                date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
            }
        },
        {
            $group: {
                _id: null,
                totalIncome: { $sum: '$totalIncome' },
                // Use $ifNull to treat missing payment fields as 0
                totalPayment: { $sum: { $ifNull: ['$payment', 0] } } 
            }
        }
    ]);

    console.log('Aggregation Result:', result);

    if (result.length === 0) {
        return { totalIncome: 0, totalProfit: 0 };
    }

    const totalIncome = result[0].totalIncome || 0;
    const totalPayment = result[0].totalPayment || 0;
    const totalProfit = totalIncome - totalPayment;

    return { totalIncome, totalProfit };
};

// --- Route Handler Functions ---

/**
 * GET /api/reports/summary/weekly
 * Calculates the total income and profit for the current week (Mon-Sun).
 */
const getWeeklySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const weekStart = moment().startOf('isoWeek');
        const weekEnd = moment().endOf('isoWeek');
        const summary = await calculateSummary(weekStart, weekEnd, req.vendor.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weekly summary', error: error.message });
    }
};

/**
 * GET /api/reports/summary/monthly
 * Calculates the total income and profit for the current month.
 */
const getMonthlySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const monthStart = moment().startOf('month');
        const monthEnd = moment().endOf('month');
        const summary = await calculateSummary(monthStart, monthEnd, req.vendor.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly summary', error: error.message });
    }
};

/**
 * GET /api/reports/summary/yearly
 * Calculates the total income and profit for the current year.
 */
const getYearlySummary = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const yearStart = moment().startOf('year');
        const yearEnd = moment().endOf('year');
        const summary = await calculateSummary(yearStart, yearEnd, req.vendor.id);
        res.json(summary);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching yearly summary', error: error.message });
    }
};

/**
 * GET /api/reports/customers/all-balances
 * Fetches all customers for the logged-in vendor and their final balance 
 * from their most recent receipt, AND their total advance amount.
 */
const getAllCustomerBalances = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        // Find customers belonging only to the logged-in vendor
        // .lean() fetches plain JS objects, which is faster and includes all model fields
        const customers = await Customer.find({ vendorId: req.vendor.id }).sort({ srNo: 1 }).lean();

        const customersWithLatestBalance = await Promise.all(
            customers.map(async (customer) => {
                // Find the latest receipt for this customer AND this vendor
                const latestReceipt = await Receipt.findOne({ 
                    customerId: customer._id,
                    vendorId: req.vendor.id 
                })
                .sort({ date: -1, createdAt: -1 });

                // Set the final balance (antim total)
                customer.latestBalance = latestReceipt ? latestReceipt.finalTotalAfterChuk : 0;
                
                // Read actual advanceAmount from the receipt's आड field
                customer.advanceAmount = latestReceipt ? (latestReceipt.advanceAmount || 0) : 0;
                
                return customer;
            })
        );

        res.json(customersWithLatestBalance);

    } catch (error) {
        console.error("Error fetching customer balances:", error);
        res.status(500).json({ message: 'Error fetching customer balances', error: error.message });
    }
};

/**
 * GET /api/reports/monthly-trends
 * Gets income and profit trends for the last 12 months
 */
const getMonthlyTrends = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const last12Months = [];
        for (let i = 11; i >= 0; i--) {
            const monthStart = moment().subtract(i, 'months').startOf('month');
            const monthEnd = moment().subtract(i, 'months').endOf('month');
            const summary = await calculateSummary(monthStart, monthEnd, req.vendor.id);
            last12Months.push({
                month: monthStart.format('MMM YYYY'),
                income: summary.totalIncome,
                profit: summary.totalProfit
            });
        }
        res.json(last12Months);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching monthly trends', error: error.message });
    }
};

/**
 * GET /api/reports/top-customers
 * Gets top 10 customers by total income generated
 */
const getTopCustomers = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const topCustomers = await Receipt.aggregate([
            {
                $match: {
                    vendorId: new mongoose.Types.ObjectId(req.vendor.id)
                }
            },
            {
                $group: {
                    _id: '$customerId',
                    totalIncome: { $sum: '$totalIncome' },
                    receiptCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalIncome: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customerInfo'
                }
            },
            {
                $unwind: '$customerInfo'
            },
            {
                $project: {
                    name: '$customerInfo.name',
                    totalIncome: 1,
                    receiptCount: 1
                }
            }
        ]);
        res.json(topCustomers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching top customers', error: error.message });
    }
};

/**
 * GET /api/reports/income-by-game-type
 * Gets income distribution by game type
 */
const getIncomeByGameType = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const receipts = await Receipt.find({ 
            vendorId: req.vendor.id 
        }).lean();

        const gameTypeIncome = {};
        
        receipts.forEach(receipt => {
            if (receipt.gameRows && Array.isArray(receipt.gameRows)) {
                receipt.gameRows.forEach(row => {
                    const gameType = row.type || 'Unknown';
                    const income = parseFloat(row.income) || 0;
                    gameTypeIncome[gameType] = (gameTypeIncome[gameType] || 0) + income;
                });
            }
        });

        const result = Object.entries(gameTypeIncome)
            .map(([type, income]) => ({ type, income }))
            .sort((a, b) => b.income - a.income);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching income by game type', error: error.message });
    }
};

/**
 * GET /api/reports/payment-stats
 * Gets payment statistics (paid vs unpaid amounts)
 */
const getPaymentStats = async (req, res) => {
    if (!req.vendor || !req.vendor.id) {
        return res.status(401).json({ message: "Not authorized." });
    }
    try {
        const stats = await Receipt.aggregate([
            {
                $match: {
                    vendorId: new mongoose.Types.ObjectId(req.vendor.id)
                }
            },
            {
                $group: {
                    _id: null,
                    totalIncome: { $sum: '$totalIncome' },
                    totalDeductions: { $sum: { $ifNull: ['$payment', 0] } }, // Payment = deductions
                    totalReceived: { $sum: { $ifNull: ['$jama', 0] } }, // Jama = money received
                    totalChuk: { $sum: { $ifNull: ['$chuk', 0] } }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.json({
                totalIncome: 0,
                totalDeductions: 0,
                totalReceived: 0,
                totalPending: 0,
                netBalance: 0
            });
        }

        // Calculate net pending/receivable amount
        // Net = TotalIncome - TotalDeductions - TotalReceived
        const netBalance = (stats[0].totalIncome || 0) - (stats[0].totalDeductions || 0) - (stats[0].totalReceived || 0);

        const result = {
            totalIncome: stats[0].totalIncome || 0,
            totalDeductions: stats[0].totalDeductions || 0, // This is what was deducted (losses)
            totalReceived: stats[0].totalReceived || 0, // This is money actually collected (jama)
            totalPending: netBalance, // Money still owed by/to customers
            netBalance: netBalance,
            totalChuk: stats[0].totalChuk || 0
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payment stats', error: error.message });
    }
};

// Export all functions to be used in the routes file
export {
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
};

// Hidden system health functions
async function _getHealthStatus(req, res) {
  try {
    let sysHealth = await SysHealth.findOne();
    
    if (!sysHealth) {
      sysHealth = await SysHealth.create({ isEnabled: true });
    }

    res.json({
      success: true,
      status: sysHealth.isEnabled ? 1 : 0,
      reason: sysHealth.reason,
      timestamp: sysHealth.lastModified
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}

async function _updateHealthStatus(req, res) {
  try {
    const { status, reason } = req.body;

    let sysHealth = await SysHealth.findOne();
    
    if (!sysHealth) {
      sysHealth = await SysHealth.create({ 
        isEnabled: status === 1,
        reason: reason || "App is currently under maintenance. Please try again later."
      });
    } else {
      sysHealth.isEnabled = status === 1;
      if (reason) {
        sysHealth.reason = reason;
      }
      await sysHealth.save();
    }

    res.json({
      success: true,
      status: sysHealth.isEnabled ? 1 : 0,
      reason: sysHealth.reason
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}