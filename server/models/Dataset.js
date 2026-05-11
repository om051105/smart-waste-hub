import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  label: { type: String, required: true },
  originalLabel: { type: String, required: true },
  confidence: { type: Number },
  imageData: { type: String }, // Storing base64 for simplicity in this demo
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Dataset', datasetSchema);
