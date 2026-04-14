import { connectDB } from '../server/index.js';
import app from '../server/index.js';

// This is the Vercel Serverless Function entry point.
// Every API request on Vercel is routed here via vercel.json rewrites.
export default async (req, res) => {
  await connectDB();
  return app(req, res);
};
