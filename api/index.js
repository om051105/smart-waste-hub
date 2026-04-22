import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Lazy-loaded app to avoid module-level side effects
let _app;
const getApp = async () => {
  if (!_app) {
    const mod = await import('../server/index.js');
    _app = mod.default;
  }
  return _app;
};

let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set in Vercel environment variables');
  await mongoose.connect(uri, {
    dbName: 'smart-waste-hub',
    serverSelectionTimeoutMS: 8000,
  });
  isConnected = true;
};

export default async (req, res) => {
  try {
    await connectDB();
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('Vercel Function Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
