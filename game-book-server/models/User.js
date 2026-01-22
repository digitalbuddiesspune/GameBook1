import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'vendor'], required: true },
  username: { type: String, required: function() { return this.role === 'admin'; } },
  mobile: { type: String, required: function() { return this.role === 'vendor'; } },
  password: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

