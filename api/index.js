import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// ── Cached DB connection for Vercel serverless warm starts ──────────────────
let isConnected = false;

const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in Vercel environment variables');
  await mongoose.connect(uri, {
    dbName: 'smart-waste-hub',
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  isConnected = true;
  console.log('✅ Vercel: MongoDB connected');
};

// ── Lazy-load Express app ───────────────────────────────────────────────────
let _app;
const getApp = async () => {
  if (!_app) {
    const mod = await import('../server/index.js');
    _app = mod.default;
  }
  return _app;
};

// ── Vercel Serverless Handler ───────────────────────────────────────────────
export default async (req, res) => {
  try {
    await connectDB();
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('❌ Vercel Function Error:', error.message);
    res.status(500).json({
      error: 'Internal Server Error',
      details: error.message,
    });
  }
};
