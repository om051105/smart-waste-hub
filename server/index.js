import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initFirebase } from './firebase.js';
import apiRoutes from './routes/api.js';

dotenv.config();

// ── Firebase Init ──────────────────────────────────────────────────────────
let firebaseReady = false;

export const connectDB = async () => {
  if (firebaseReady) return;
  initFirebase();
  firebaseReady = true;
};

// ── Express App ────────────────────────────────────────────────────────────
const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── DB Middleware: try to connect but NEVER block requests ─────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('❌ Firebase init error:', err.message);
    req.dbError = err.message;
  }
  next();
});

// ── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    db: firebaseReady ? 'firebase-connected' : 'disconnected',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── Serve React Frontend (Production) ────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// ── Start Local Dev Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`🚀 Server running → http://localhost:${PORT}`));
    })
    .catch(err => {
      console.error(`⚠️  Firebase init failed: ${err.message}`);
      app.listen(PORT, () => console.log(`🚀 Server running (Firebase offline) → http://localhost:${PORT}`));
    });
}

export default app;
