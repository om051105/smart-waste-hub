import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'worker', 'admin', 'champion'], default: 'citizen' },
  complianceScore: { type: Number, default: 0 },
  rewardPoints: { type: Number, default: 0 },
  avatar: { type: String },
  area: { type: String },
}, { timestamps: true });

// ── Role-Specific Models (This creates 4 separate collections in Atlas) ───────
export const Citizen = mongoose.model('Citizen', userSchema, 'citizens');
export const Worker = mongoose.model('Worker', userSchema, 'workers');
export const Admin = mongoose.model('Admin', userSchema, 'admins');
export const Champion = mongoose.model('Champion', userSchema, 'champions');

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getModelByRole = (role) => {
  switch (role) {
    case 'admin': return Admin;
    case 'worker': return Worker;
    case 'champion': return Champion;
    case 'citizen':
    default: return Citizen;
  }
};

export const allUserModels = [Citizen, Worker, Admin, Champion];

export default Citizen; // Default for backward compatibility
