import app, { connectDB } from '../server/index.js';

export default async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Vercel Function Error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
