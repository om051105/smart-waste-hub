import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config();

async function checkUser() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not found in environment');
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: 'smart-waste-hub' });
    const user = await User.findOne({ email: 'singhsid2005@gmail.com' });
    if (user) {
      console.log('✅ User FOUND in database:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User NOT found in database.');
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error connecting to MongoDB:', err.message);
  }
}

checkUser();
