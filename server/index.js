import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

dotenv.config();

// ── MongoDB Connection ─────────────────────────────────────────────────────
let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined in environment variables');
  await mongoose.connect(uri, {
    dbName: 'smart-waste-hub',
    serverSelectionTimeoutMS: 8000,
  });
  isConnected = true;
  console.log('✅ MongoDB Atlas connected');
};

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
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

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





const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));
  }).catch(err => {
    console.log(`⚠️ Local server started without DB: ${err.message}`);
    app.listen(PORT, () => console.log(`🚀 Server running (DB Offline) → http://localhost:${PORT}`));
  });
}

export default app;
