import DailyGlobalValues from "../models/DailyGlobalValues.js";

// @desc    Create or update global daily values
// @route   POST /api/daily-global-values
// @access  Private
export const createOrUpdateDailyGlobalValues = async (req, res) => {
  try {
    const { date, open, close, jod } = req.body;
    const vendorId = req.vendor.id;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    // Find existing record or create new one
    const dailyValues = await DailyGlobalValues.findOneAndUpdate(
      { vendorId, date },
      {
        vendorId,
        date,
        open: open || "",
        close: close || "",
        jod: jod || "",
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Daily global values saved successfully",
      dailyValues,
    });
  } catch (error) {
    console.error("Error saving daily global values:", error);
    res.status(500).json({ message: "Failed to save daily global values", error: error.message });
  }
};

// @desc    Get global daily values for a specific date
// @route   GET /api/daily-global-values/:date
// @access  Private
export const getDailyGlobalValues = async (req, res) => {
  try {
    const { date } = req.params;
    const vendorId = req.vendor.id;

    const dailyValues = await DailyGlobalValues.findOne({
      vendorId,
      date,
    });

    if (!dailyValues) {
      return res.status(200).json({
        success: true,
        dailyValues: null,
        message: "No global values found for this date",
      });
    }

    res.status(200).json({
      success: true,
      dailyValues,
    });
  } catch (error) {
    console.error("Error fetching daily global values:", error);
    res.status(500).json({ message: "Failed to fetch daily global values", error: error.message });
  }
};

// @desc    Delete global daily values for a specific date
// @route   DELETE /api/daily-global-values/:date
// @access  Private
export const deleteDailyGlobalValues = async (req, res) => {
  try {
    const { date } = req.params;
    const vendorId = req.vendor.id;

    const deletedValues = await DailyGlobalValues.findOneAndDelete({
      vendorId,
      date,
    });

    if (!deletedValues) {
      return res.status(404).json({ message: "Daily global values not found" });
    }

    res.status(200).json({
      success: true,
      message: "Daily global values deleted successfully",
      dailyValues: deletedValues,
    });
  } catch (error) {
    console.error("Error deleting daily global values:", error);
    res.status(500).json({ message: "Failed to delete daily global values", error: error.message });
  }
};
