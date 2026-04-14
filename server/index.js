import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-waste-hub';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Connect to DB and Start Server
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Seed initial demo data
    const { default: User } = await import('./models/User.js');
    const { default: Facility } = await import('./models/Facility.js');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial data...');
      await User.insertMany([
        { _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85101'), name: 'Admin User', email: 'admin@wastewise.com', password: 'password123', role: 'admin', complianceScore: 100, rewardPoints: 500 },
        { _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85102'), name: 'Jane Citizen', email: 'jane@example.com', password: 'password123', role: 'citizen', complianceScore: 75, rewardPoints: 120 },
        { _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85103'), name: 'Worker Mike', email: 'mike@wastewise.com', password: 'password123', role: 'worker', complianceScore: 90, rewardPoints: 200, area: 'Zone A' },
        { _id: new mongoose.Types.ObjectId('60d5ec49f1b2a945d8b85104'),name: 'Green Sara', email: 'sara@wastewise.com', password: 'password123', role: 'champion', complianceScore: 95, rewardPoints: 350, area: 'Zone B' },
      ]);
      await Facility.insertMany([
        { name: 'GreenCycle Center', type: 'recycling', lat: 28.615, lng: 77.21, address: '123 Green Rd' },
        { name: 'CompostHub', type: 'compost', lat: 28.62, lng: 77.205, address: '45 Organic Ln' },
        { name: 'MetalMax Scrap', type: 'scrap', lat: 28.608, lng: 77.218, address: '78 Industrial Ave' },
        { name: 'EcoReclaim', type: 'recycling', lat: 28.625, lng: 77.195, address: '12 Eco Blvd' },
      ]);
      console.log('Seed complete!');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });
