import dotenv from 'dotenv';
dotenv.config();

// ── Lazy-load Express app (Firebase initializes inside server/index.js) ──────
let _app;
const getApp = async () => {
  if (!_app) {
    const mod = await import('../server/index.js');
    _app = mod.default;
  }
  return _app;
};

// ── Vercel Serverless Handler ─────────────────────────────────────────────────
export default async (req, res) => {
  try {
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
