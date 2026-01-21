const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vendor", // Links this to the Vendor who owns the customer
    },
    srNo: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
   timestamps: true,
  }
);

// Ensures that for any given vendor, the srNo is unique.
customerSchema.index({ vendorId: 1, srNo: 1 }, { unique: true });

module.exports = mongoose.model("Customer", customerSchema);