import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';
import { allUserModels, getModelByRole } from './models/User.js';

dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));

// ── Fix __dirname for ES Modules ──────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── Serve Frontend (only for local production mode) ───────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ── MongoDB Connection (cached for serverless) ────────────────────────────────
let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not set in environment variables!');
    return;
  }
  try {
    await mongoose.connect(uri, { dbName: 'smart-waste-hub' });
    isConnected = true;
    console.log('✅ MongoDB Atlas connected');
    
    // ── Migration Check ──────────────────────────────────────────────────────────
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length > 0) {
      console.log('🔄 Old "users" collection found. Migrating data...');
      const oldUsers = await db.collection('users').find({}).toArray();
      
      for (const u of oldUsers) {
        const Model = getModelByRole(u.role);
        // Check if already exists in new collection
        const exists = await Model.findOne({ email: u.email });
        if (!exists) {
          const { _id, ...userData } = u; // Keep original data except maybe _id if conflict
          await new Model(userData).save();
        }
      }
      
      // Optionally drop old collection to clarify the UI
      try {
        await db.collection('users').drop();
        console.log('🗑️ Old "users" collection dropped successfully.');
      } catch (e) {
        console.log('⚠️ Could not drop old collection (might be already gone)');
      }
    }

    await seedDefaultUsers();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
};

// ── Seed Default Demo Users ───────────────────────────────────────────────────
const seedDefaultUsers = async () => {
  // Check if any users exist in any collection
  const counts = await Promise.all(allUserModels.map(M => M.countDocuments()));
  const total = counts.reduce((a, b) => a + b, 0);
  if (total > 0) return; // Already seeded

  const defaults = [
    { name: 'Jane Citizen',   email: 'citizen@waste.com',  password: 'password', role: 'citizen',  complianceScore: 75, rewardPoints: 320, area: 'Central District' },
    { name: 'Admin User',     email: 'admin@waste.com',    password: 'password', role: 'admin',    complianceScore: 88, rewardPoints: 500, area: 'Admin Tower' },
    { name: 'Worker Mike',    email: 'worker@waste.com',   password: 'password', role: 'worker',   complianceScore: 90, rewardPoints: 410, area: 'City Sector 7' },
    { name: 'Green Champion', email: 'champion@waste.com', password: 'password', role: 'champion', complianceScore: 95, rewardPoints: 610, area: 'Eco Park' },
  ];

  for (const userData of defaults) {
    const Model = getModelByRole(userData.role);
    const user = new Model(userData);
    await user.save();
  }
  
  console.log('🌱 Default demo users seeded into role collections');
};

// ── Start Local Dev Server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));
  });
}

export default app;
