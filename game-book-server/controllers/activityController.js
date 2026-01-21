const Activity = require('../models/Activity');

/**
 * @desc    Get recent activities for the logged-in vendor
 * @route   GET /api/activities/recent
 * @access  Private
 */
const getRecentActivities = async (req, res) => {
  try {
    // req.vendor.id is added by your 'protect' middleware from the token
    const activities = await Activity.find({ vendorId: req.vendor.id })
      .sort({ createdAt: -1 }) // Get the newest activities first
      .limit(5); // Limit to the 5 most recent activities

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getRecentActivities,
};