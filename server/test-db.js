import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri.replace(/:([^@]+)@/, ':****@'));

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Success!');
  process.exit(0);
} catch (err) {
  console.error('❌ Failed:', err.message);
  process.exit(1);
}
