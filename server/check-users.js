import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
const users = await User.find({}, { password: 0 });
console.log('Current Users:', JSON.stringify(users, null, 2));
await mongoose.disconnect();
