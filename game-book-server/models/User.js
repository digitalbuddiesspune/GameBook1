const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'vendor'], required: true },
  username: { type: String, required: function() { return this.role === 'admin'; } },
  mobile: { type: String, required: function() { return this.role === 'vendor'; } },
  password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

