import mongoose from "mongoose";

// Schema for global daily Open/Close/Jod values (applicable to all markets and customers)
const dailyGlobalValuesSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Date in YYYY-MM-DD format
  date: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Global values for the day
  open: {
    type: String,
    default: "",
    trim: true,
  },
  close: {
    type: String,
    default: "",
    trim: true,
  },
  jod: {
    type: String,
    default: "",
    trim: true,
  },
}, {
  timestamps: true,
});

// Ensure one record per vendor per day
dailyGlobalValuesSchema.index({ vendorId: 1, date: 1 }, { unique: true });

// Index for faster queries
dailyGlobalValuesSchema.index({ vendorId: 1, date: 1 });

export default mongoose.model("DailyGlobalValues", dailyGlobalValuesSchema);
