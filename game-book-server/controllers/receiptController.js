// const Receipt = require("../models/Receipt");
// // The Activity model is optional but good for logging changes.
// // const Activity = require('../models/Activity'); 

// // @desc    Create a new receipt
// // @route   POST /api/receipts
// // @access  Private
// const createReceipt = async (req, res) => {
//   try {
//     const receiptData = {
//         ...req.body,
//         date: new Date(req.body.date), // Ensure date is stored as a valid Date object
//         vendorId: req.vendor.id        // Inject the logged-in vendor's ID from middleware
//     };
// 
//     const receipt = new Receipt(receiptData);
//     await receipt.save();
// 
//     // Optional: Log this action
//     // await Activity.create({
//     //   vendorId: req.vendor.id,
//     //   type: 'NEW_RECEIPT',
//     //   description: `Receipt created for customer '${receipt.customerName}'`,
//     // });
// 
//     res.status(201).json({ message: "Receipt saved successfully", receipt });
//   } catch (error) {
//     console.error("Error saving receipt:", error);
//     res.status(500).json({ message: "Error saving receipt", error: error.message });
//   }
// };

// // @desc    Get all receipts for the logged-in vendor
// // @route   GET /api/receipts
// // @access  Private
// const getAllReceipts = async (req, res) => {
//   try {
//     // Find all receipts that belong to the currently logged-in vendor
//     const receipts = await Receipt.find({ vendorId: req.vendor.id }).sort({ date: -1 });
//     res.status(200).json({ receipts });
//   } catch (err) {
//     console.error("Error fetching receipts:", err);
//     res.status(500).json({ message: "Failed to fetch receipts" });
//   }
// };

// // @desc    Update a specific receipt
// // @route   PUT /api/receipts/:id
// // @access  Private
// const updateReceipt = async (req, res) => {
//     try {
//         const { id } = req.params;
// 
//         // Find the receipt by its ID and ensure it belongs to the logged-in vendor for security
//         const updatedReceipt = await Receipt.findOneAndUpdate(
//             { _id: id, vendorId: req.vendor.id }, 
//             req.body, // The updated data from the frontend
//             { new: true, runValidators: true } // Options: return the new version and run schema validators
//         );
// 
//         if (!updatedReceipt) {
//             return res.status(404).json({ message: "Receipt not found or you are not authorized" });
//         }
//         res.status(200).json({ message: "Receipt updated successfully", receipt: updatedReceipt });
//     } catch (err) {
//         console.error("Error updating receipt:", err);
//         res.status(500).json({ message: "Failed to update receipt" });
//     }
// };

// // @desc    Delete a receipt
// // @route   DELETE /api/receipts/:id
// // @access  Private
// const deleteReceipt = async (req, res) => {
//     try {
//         const { id } = req.params;
// 
//         // Find the receipt by its ID and ensure it belongs to the logged-in vendor
//         const deletedReceipt = await Receipt.findOneAndDelete({ _id: id, vendorId: req.vendor.id });
// 
//         if (!deletedReceipt) {
//             return res.status(404).json({ message: "Receipt not found or you are not authorized" });
//         }
//         res.status(200).json({ message: "Receipt deleted successfully" });
//     } catch (err) {
//         console.error("Error deleting receipt:", err);
//         res.status(500).json({ message: "Failed to delete receipt" });
//     }
// };

// module.exports = {
//   createReceipt,
//   getAllReceipts,
//   updateReceipt,
//   deleteReceipt,
// };

const Receipt = require("../models/Receipt");
// The Activity model is optional but good for logging changes.
// const Activity = require('../models/Activity'); 

// Helper to safely evaluate math expressions (e.g., "10+20") matching frontend logic
const evaluateExpression = (expression) => {
    if (typeof expression !== "string" || !expression.trim()) {
        return 0;
    }
    try {
        // Sanitize: allow only numbers and basic math operators
        let sanitized = expression.replace(/[^0-9+\-*/.]/g, "");
        // Remove trailing operators
        sanitized = sanitized.replace(/[+\-*/.]+$/, "");
        if (!sanitized) return 0;

        // Use Function constructor for safer eval-like behavior
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${sanitized}`)();
        return isFinite(result) ? result : 0;
    } catch (error) {
        return 0;
    }
};

// @desc    Create a new receipt
// @route   POST /api/receipts
// @access  Private
const createReceipt = async (req, res) => {
    try {
        const receiptData = {
            ...req.body,
            // Ensure date is stored as a valid Date object
            date: new Date(req.body.date),
            // Inject the logged-in vendor's ID from middleware
            vendorId: req.vendor.id
        };

        const receipt = new Receipt(receiptData);
        await receipt.save();

        // Optional: Log this action
        // await Activity.create({
        //   vendorId: req.vendor.id,
        //   type: 'NEW_RECEIPT',
        //   description: `Receipt created for customer '${receipt.customerName}'`,
        // });

        res.status(201).json({ message: "Receipt saved successfully", receipt });
    } catch (error) {
        console.error("Error saving receipt:", error);
        // Handle validation errors specifically if needed
        const message = error.name === 'ValidationError' ? error.message : "Error saving receipt";
        res.status(500).json({ message, error: error.message });
    }
};

// @desc    Get all receipts for the logged-in vendor with pagination
// @route   GET /api/receipts?page=1&limit=100
// @access  Private
const getAllReceipts = async (req, res) => {
    try {
        // Get pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        
        // Validate pagination parameters
        if (page < 1) {
            return res.status(400).json({ message: "Page number must be greater than 0" });
        }
        if (limit < 1 || limit > 100) {
            return res.status(400).json({ message: "Limit must be between 1 and 100" });
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Get total count of receipts for this vendor
        const totalReceipts = await Receipt.countDocuments({ vendorId: req.vendor.id });
        
        // Calculate total pages
        const totalPages = Math.ceil(totalReceipts / limit);

        // Find receipts with pagination
        const receipts = await Receipt.find({ vendorId: req.vendor.id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            receipts,
            pagination: {
                currentPage: page,
                totalPages,
                totalReceipts,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        console.error("Error fetching receipts:", err);
        res.status(500).json({ message: "Failed to fetch receipts" });
    }
};

// @desc    Update a specific receipt
// @route   PUT /api/receipts/:id
// @access  Private
const updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        // Prepare update data, ensuring the date field is converted back to a Date object
        const updateData = {
            ...req.body,
            date: new Date(req.body.date),
        };

        // Find the receipt by its ID and ensure it belongs to the logged-in vendor for security
        const updatedReceipt = await Receipt.findOneAndUpdate(
            { _id: id, vendorId: req.vendor.id },
            updateData,
            { new: true, runValidators: true } // Options: return the new version and run schema validators
        );

        if (!updatedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized" });
        }
        res.status(200).json({ message: "Receipt updated successfully", receipt: updatedReceipt });
    } catch (err) {
        console.error("Error updating receipt:", err);
        // Handle validation errors specifically if needed
        const message = err.name === 'ValidationError' ? err.message : "Failed to update receipt";
        res.status(500).json({ message, error: err.message });
    }
};

// @desc    Delete a receipt
// @route   DELETE /api/receipts/:id
// @access  Private
const deleteReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the receipt by its ID and ensure it belongs to the logged-in vendor
        const deletedReceipt = await Receipt.findOneAndDelete({ _id: id, vendorId: req.vendor.id });

        if (!deletedReceipt) {
            return res.status(404).json({ message: "Receipt not found or you are not authorized" });
        }
        res.status(200).json({ message: "Receipt deleted successfully" });
    } catch (err) {
        console.error("Error deleting receipt:", err);
        res.status(500).json({ message: "Failed to delete receipt" });
    }
};

// @desc    Get daily totals grouped by company and game type
// @route   GET /api/receipts/daily-totals?date=YYYY-MM-DD
// @access  Private
const getDailyTotals = async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date parameter is required (format: YYYY-MM-DD)" });
        }

        // Parse the date to get start and end of day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Find all receipts for this vendor on the specified date
        const receipts = await Receipt.find({
            vendorId: req.vendor.id,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // Group receipts by company and calculate totals
        const totalsByCompany = {};
        const uniqueCustomers = new Set();

        receipts.forEach(receipt => {
            const company = receipt.customerCompany || "No Company";

            if (!totalsByCompany[company]) {
                totalsByCompany[company] = {
                    totalIncome: 0,
                    totalPayment: 0,
                    customerCount: 0,
                    receiptsCount: 0,
                    customers: new Set(),
                    gameTypeBreakdown: {} // Game type breakdown
                };
            }

            // Add to company totals
            totalsByCompany[company].totalIncome += receipt.totalIncome || 0;
            totalsByCompany[company].totalPayment += receipt.payment || 0;
            totalsByCompany[company].receiptsCount += 1;
            totalsByCompany[company].customers.add(receipt.customerId);

            // Calculate game type breakdown
            if (receipt.gameRows && Array.isArray(receipt.gameRows)) {
                receipt.gameRows.forEach(row => {
                    const gameType = row.type || 'Unknown';

                    if (!totalsByCompany[company].gameTypeBreakdown[gameType]) {
                        totalsByCompany[company].gameTypeBreakdown[gameType] = {
                            income: 0,
                            payment: 0,
                            count: 0
                        };
                    }

                    // Add income from this game row
                    const income = parseFloat(row.income) || 0;
                    totalsByCompany[company].gameTypeBreakdown[gameType].income += income;

                    // --- Calculate payment for this game row using accurate logic ---
                    // 1. Evaluate expressions (e.g., "10+20")
                    const oVal = evaluateExpression(row.o);
                    const jodVal = evaluateExpression(row.jod);
                    const koVal = evaluateExpression(row.ko);

                    // 2. Get multiplier
                    const multiplier = Number(row.multiplier) || 1;

                    let rowPayment = 0;

                    // 3. Calculate O, Jod, Ko totals
                    // Logic: O * mult, Jod * mult * 10, Ko * mult
                    if (row.multiplier !== undefined) {
                        rowPayment += (oVal * multiplier);
                        rowPayment += (jodVal * multiplier * 10);
                        rowPayment += (koVal * multiplier);
                    } else {
                        rowPayment += oVal + jodVal + koVal;
                    }

                    // 4. Calculate Pan, Gun, Special totals (val1 * val2)
                    const panVal1 = parseFloat(row.pan?.val1) || 0;
                    const panVal2 = parseFloat(row.pan?.val2) || 0;
                    rowPayment += (panVal1 * panVal2);

                    const gunVal1 = parseFloat(row.gun?.val1) || 0;
                    const gunVal2 = parseFloat(row.gun?.val2) || 0;
                    rowPayment += (gunVal1 * gunVal2);

                    const specialVal1 = parseFloat(row.special?.val1) || 0;
                    const specialVal2 = parseFloat(row.special?.val2) || 0;
                    rowPayment += (specialVal1 * specialVal2);

                    totalsByCompany[company].gameTypeBreakdown[gameType].payment += rowPayment;
                    totalsByCompany[company].gameTypeBreakdown[gameType].count += 1;
                });
            }

            // Track unique customers globally
            uniqueCustomers.add(receipt.customerId);
        });

        // Convert Sets to counts and remove the Set objects
        Object.keys(totalsByCompany).forEach(company => {
            totalsByCompany[company].customerCount = totalsByCompany[company].customers.size;
            delete totalsByCompany[company].customers;
        });

        // Calculate grand totals
        const grandTotals = {
            totalIncome: 0,
            totalPayment: 0,
            totalCustomers: uniqueCustomers.size,
            totalReceipts: receipts.length
        };

        Object.values(totalsByCompany).forEach(companyData => {
            grandTotals.totalIncome += companyData.totalIncome;
            grandTotals.totalPayment += companyData.totalPayment;
        });

        res.status(200).json({
            date,
            totalsByCompany,
            grandTotals
        });
    } catch (err) {
        console.error("Error fetching daily totals:", err);
        res.status(500).json({ message: "Failed to fetch daily totals", error: err.message });
    }
};

module.exports = {
    createReceipt,
    getAllReceipts,
    updateReceipt,
    deleteReceipt,
    getDailyTotals,
};
