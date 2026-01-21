const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., 'customerSrNo_5f8d0a7c7f8b9a2b1c3d4e5f'
  seq: { type: Number, default: 0 },
});

// Hidden system health schema
const sysHealthSchema = new mongoose.Schema({
  isEnabled: {
    type: Boolean,
    default: true
  },
  reason: {
    type: String,
    default: ".."
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

sysHealthSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

const Counter = mongoose.model("Counter", counterSchema);
const SysHealth = mongoose.model("SysHealth", sysHealthSchema);

module.exports = Counter;
module.exports.SysHealth = SysHealth;
