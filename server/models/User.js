import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We'll store plain text for this demo backend
  role: { type: String, enum: ['citizen', 'worker', 'admin', 'champion'], default: 'citizen' },
  complianceScore: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  avatar: { type: String },
  area: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
