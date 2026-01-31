import MarketDetails from "../models/MarketDetails.js";

// @desc    Create or update market details
// @route   POST /api/market-details
// @access  Private
export const createOrUpdateMarketDetails = async (req, res) => {
  try {
    const { customerId, companyName, date, open, close, jod, gameRowOpen, gameRowClose } = req.body;
    const vendorId = req.vendor.id;

    // Validate required fields
    if (!customerId || !companyName || !date) {
      return res.status(400).json({
        success: false,
        message: "customerId, companyName, and date are required",
      });
    }

    // Prepare update data
    const updateData = {
      vendorId,
      customerId,
      companyName,
      date,
    };

    // Add optional fields if provided
    if (open !== undefined) updateData.open = open;
    if (close !== undefined) updateData.close = close;
    if (jod !== undefined) updateData.jod = jod;
    if (gameRowOpen !== undefined) updateData.gameRowOpen = gameRowOpen;
    if (gameRowClose !== undefined) updateData.gameRowClose = gameRowClose;

    // Use findOneAndUpdate with upsert to create or update
    const marketDetails = await MarketDetails.findOneAndUpdate(
      {
        vendorId,
        customerId,
        companyName,
        date,
      },
      updateData,
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Market details saved successfully",
      marketDetails,
    });
  } catch (error) {
    console.error("Error saving market details:", error);
    res.status(500).json({
      success: false,
      message: "Error saving market details",
      error: error.message,
    });
  }
};

// @desc    Get market details for a specific customer and market
// @route   GET /api/market-details/:customerId/:companyName/:date
// @access  Private
export const getMarketDetails = async (req, res) => {
  try {
    const { customerId, companyName, date } = req.params;
    const vendorId = req.vendor.id;

    const marketDetails = await MarketDetails.findOne({
      vendorId,
      customerId,
      companyName,
      date,
    });

    if (!marketDetails) {
      return res.status(404).json({
        success: false,
        message: "Market details not found",
      });
    }

    res.status(200).json({
      success: true,
      marketDetails,
    });
  } catch (error) {
    console.error("Error fetching market details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching market details",
      error: error.message,
    });
  }
};

// @desc    Get all market details for a customer
// @route   GET /api/market-details/customer/:customerId
// @access  Private
export const getCustomerMarketDetails = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { date } = req.query; // Optional date filter
    const vendorId = req.vendor.id;

    const query = {
      vendorId,
      customerId,
    };

    if (date) {
      query.date = date;
    }

    const marketDetails = await MarketDetails.find(query).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: marketDetails.length,
      marketDetails,
    });
  } catch (error) {
    console.error("Error fetching customer market details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching customer market details",
      error: error.message,
    });
  }
};

// @desc    Get all market details for a specific date
// @route   GET /api/market-details/date/:date
// @access  Private
export const getMarketDetailsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const vendorId = req.vendor.id;

    const marketDetails = await MarketDetails.find({
      vendorId,
      date,
    }).sort({ companyName: 1, customerId: 1 });

    res.status(200).json({
      success: true,
      count: marketDetails.length,
      marketDetails,
    });
  } catch (error) {
    console.error("Error fetching market details by date:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching market details by date",
      error: error.message,
    });
  }
};

// @desc    Delete market details
// @route   DELETE /api/market-details/:id
// @access  Private
export const deleteMarketDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.vendor.id;

    const marketDetails = await MarketDetails.findOneAndDelete({
      _id: id,
      vendorId, // Ensure vendor owns this record
    });

    if (!marketDetails) {
      return res.status(404).json({
        success: false,
        message: "Market details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Market details deleted successfully",
      marketDetails,
    });
  } catch (error) {
    console.error("Error deleting market details:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting market details",
      error: error.message,
    });
  }
};

// @desc    Delete market details by customer, market, and date
// @route   DELETE /api/market-details
// @access  Private
export const deleteMarketDetailsByParams = async (req, res) => {
  try {
    const { customerId, companyName, date } = req.body;
    const vendorId = req.vendor.id;

    if (!customerId || !companyName || !date) {
      return res.status(400).json({
        success: false,
        message: "customerId, companyName, and date are required",
      });
    }

    const marketDetails = await MarketDetails.findOneAndDelete({
      vendorId,
      customerId,
      companyName,
      date,
    });

    if (!marketDetails) {
      return res.status(404).json({
        success: false,
        message: "Market details not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Market details deleted successfully",
      marketDetails,
    });
  } catch (error) {
    console.error("Error deleting market details:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting market details",
      error: error.message,
    });
  }
};

// @desc    Clear all market details for a specific date (useful for day change)
// @route   DELETE /api/market-details/date/:date
// @access  Private
export const clearMarketDetailsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const vendorId = req.vendor.id;

    const result = await MarketDetails.deleteMany({
      vendorId,
      date,
    });

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} market details for date ${date}`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing market details by date:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing market details by date",
      error: error.message,
    });
  }
};
