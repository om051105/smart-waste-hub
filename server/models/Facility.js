import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['recycling', 'compost', 'scrap'], required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

facilitySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Facility', facilitySchema);
