import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-waste-hub';

app.use(cors());
app.use(express.json());

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
app.use('/api', apiRoutes);

// Serve Frontend in Production
app.use(express.static(path.join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Connect to DB and Export for Vercel
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGO_URI);
      console.log('✅ Connected to MongoDB');
    }
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }
};

// Start Server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}

export default async (req, res) => {
  await connectDB();
  return app(req, res);
};

