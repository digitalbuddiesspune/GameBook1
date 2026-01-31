import mongoose from "mongoose";

// Schema for game row data (same structure as in Receipt)
const simpleValueSchema = new mongoose.Schema({
  val1: { type: String, default: "" },
  val2: { type: String, default: "" },
}, { _id: false });

const typedValueSchema = new mongoose.Schema({
  val1: { type: String, default: "" },
  val2: { type: String, default: "" },
  type: { type: String, default: "" }
}, { _id: false });

const gameRowSchema = new mongoose.Schema({
  id: { type: Number },
  type: { type: String, trim: true },
  income: { type: String, default: '' },
  o: { type: String, default: '' },
  jod: { type: String, default: '' },
  ko: { type: String, default: '' },
  pan: typedValueSchema,
  gun: simpleValueSchema,
  special: typedValueSchema,
  multiplier: { type: Number }
}, { _id: false });

// Main MarketDetails Schema
const marketDetailsSchema = new mongoose.Schema({
  // --- Core References ---
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  
  // --- Market Information ---
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  
  // --- Date (YYYY-MM-DD format for day-based queries) ---
  date: {
    type: String, // Format: "YYYY-MM-DD"
    required: true,
  },
  
  // --- Open/Close Market Values ---
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
  
  // --- Saved Game Rows ---
  gameRowOpen: gameRowSchema, // For ओ. (आ.) type
  gameRowClose: gameRowSchema, // For को. (कु.) type
  
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Compound index to ensure unique market details per customer+market+date
marketDetailsSchema.index({ vendorId: 1, customerId: 1, companyName: 1, date: 1 }, { unique: true });

// Index for faster queries
marketDetailsSchema.index({ vendorId: 1, customerId: 1, date: 1 });
marketDetailsSchema.index({ vendorId: 1, companyName: 1, date: 1 });

export default mongoose.model("MarketDetails", marketDetailsSchema);
