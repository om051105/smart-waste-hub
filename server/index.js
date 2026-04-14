import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import User from './models/User.js';

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ── MongoDB Connection ────────────────────────────────────────────────────────
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGO_URI;
  if (!uri) return;

  try {
    await mongoose.connect(uri, { dbName: 'smart-waste-hub' });
    isConnected = true;
    console.log('✅ MongoDB Atlas connected');
    
    // ── Reverse Migration Logic ──────────────────────────────────────────────
    const db = mongoose.connection.db;
    const roleCollections = ['citizens', 'workers', 'admins', 'champions'];
    
    for (const collName of roleCollections) {
      const exists = await db.listCollections({ name: collName }).toArray();
      if (exists.length > 0) {
        console.log(`🔄 Reverting data from "${collName}" back to "users"...`);
        const docs = await db.collection(collName).find({}).toArray();
        for (const doc of docs) {
          const { _id, ...userData } = doc;
          // Only insert if email doesn't already exist in main collection
          const alreadyInUsers = await User.findOne({ email: userData.email });
          if (!alreadyInUsers) {
            await new User(userData).save();
          }
        }
        await db.collection(collName).drop();
        console.log(`🗑️ Dropped "${collName}"`);
      }
    }

    await seedDefaultUsers();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// ── Seed Default Users ────────────────────────────────────────────────────────
const seedDefaultUsers = async () => {
  const count = await User.countDocuments();
  if (count > 0) return;

  const defaults = [
    { name: 'Jane Citizen',   email: 'citizen@waste.com',  password: 'password', role: 'citizen',  complianceScore: 75, rewardPoints: 320, area: 'Central District' },
    { name: 'Admin User',     email: 'admin@waste.com',    password: 'password', role: 'admin',    complianceScore: 88, rewardPoints: 500, area: 'Admin Tower' },
    { name: 'Worker Mike',    email: 'worker@waste.com',   password: 'password', role: 'worker',   complianceScore: 90, rewardPoints: 410, area: 'City Sector 7' },
    { name: 'Green Champion', email: 'champion@waste.com', password: 'password', role: 'champion', complianceScore: 95, rewardPoints: 610, area: 'Eco Park' },
  ];

  await User.insertMany(defaults);
  console.log('🌱 Default demo users seeded into main collection');
};

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));
  });
}

export default app;
