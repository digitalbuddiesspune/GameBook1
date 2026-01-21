const mongoose = require('mongoose');

const activitySchema = mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vendor', // This links the activity to a specific vendor
    },
    type: {
      type: String,
      required: true,
      enum: ['NEW_CUSTOMER', 'NEW_RECEIPT', 'BALANCE_UPDATE'], // Types of activities you want to track
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model('Activity', activitySchema);