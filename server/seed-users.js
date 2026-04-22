import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Facility from './models/Facility.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

await mongoose.connect(MONGO_URI);
console.log('✅ Connected to MongoDB Atlas');

// Seed Users
const users = [
  {
    _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85101'),
    name: 'System Administrator',
    email: 'admin@wastewise.com',
    password: 'admin123',
    role: 'admin',
    complianceScore: 1000,
    rewardPoints: 500
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85102'),
    name: 'Jane Citizen',
    email: 'citizen@wastewise.com',
    password: 'citizen123',
    role: 'citizen',
    complianceScore: 85,
    rewardPoints: 120,
    area: 'Sector 14'
  },
  {
    _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85103'),
    name: 'Mike Worker',
    email: 'worker@wastewise.com',
    password: 'worker123',
    role: 'worker',
    complianceScore: 150,
    rewardPoints: 0,
    area: 'Zone A'
  }
];

await User.deleteMany({});
await User.insertMany(users);
console.log('✅ Users seeded');

// Seed Facilities
const facilities = [
  { name: 'Main Recycling Center', type: 'recycling', lat: 28.6139, lng: 77.2090, address: 'Sector 1, New Delhi' },
  { name: 'Organic Compost Hub', type: 'compost', lat: 28.6210, lng: 77.2150, address: 'Central Park Road' },
  { name: 'Plastic Recovery Plant', type: 'recycling', lat: 28.6050, lng: 77.1950, address: 'Industrial Area Phase II' }
];

await Facility.deleteMany({});
await Facility.insertMany(facilities);
console.log('✅ Facilities seeded');

await mongoose.disconnect();
console.log('🎉 Seeding complete!');
