// Run this once to seed missing collections & complaints
// Usage: node server/seed-extra.js

import mongoose from 'mongoose';
import WasteCollection from './models/WasteCollection.js';
import Complaint from './models/Complaint.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/smart-waste-hub';

await mongoose.connect(MONGO_URI);
console.log('✅ Connected');

// Worker Mike's ID (seeded earlier)
const workerMikeId = new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85103');
const janeId = '60d5ec49f1b2a945d8b85102';
const today = new Date().toISOString().split('T')[0];

// Clear & re-seed collections
await WasteCollection.deleteMany({});
await WasteCollection.insertMany([
  { workerId: workerMikeId, area: 'Sector 14 - Zone A', status: 'completed', date: today, households: 45 },
  { workerId: workerMikeId, area: 'Sector 15 - Zone A', status: 'pending', date: today, households: 38 },
  { workerId: workerMikeId, area: 'Sector 16 - Zone A', status: 'pending', date: today, households: 52 },
  { workerId: workerMikeId, area: 'Sector 17 - Zone B', status: 'missed', date: today, households: 30 },
]);
console.log('✅ Collections seeded');

// Seed demo complaints if empty
const existingComplaints = await Complaint.countDocuments();
if (existingComplaints === 0) {
  await Complaint.insertMany([
    { userId: janeId, userName: 'Jane Citizen', description: 'Overflowing garbage bin near Block 5', location: { lat: 28.612, lng: 77.208 }, status: 'pending' },
    { userId: janeId, userName: 'Jane Citizen', description: 'Illegal dumping in the park', location: { lat: 28.618, lng: 77.202 }, status: 'in_progress' },
  ]);
  console.log('✅ Complaints seeded');
} else {
  console.log(`ℹ️  ${existingComplaints} complaints already exist, skipping.`);
}

await mongoose.disconnect();
console.log('🎉 Done! Refresh your browser to see all data.');
