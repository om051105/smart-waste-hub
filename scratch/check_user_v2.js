import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  area: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function checkUser() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not found in environment');
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: 'smart-waste-hub' });
    console.log('✅ Connected to MongoDB');
    
    const user = await User.findOne({ email: 'singhsid2005@gmail.com' });
    if (user) {
      console.log('✅ Found User:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found');
      // Let's also list all users to see what's in there
      const allUsers = await User.find().limit(5);
      console.log('📝 Sample Users (top 5):');
      allUsers.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}]`));
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkUser();
