import mongoose from 'mongoose';

const wasteCollectionSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  area: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'missed'], default: 'pending' },
  date: { type: String, required: true },
  households: { type: Number, required: true }
}, { timestamps: true });

wasteCollectionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('WasteCollection', wasteCollectionSchema);
