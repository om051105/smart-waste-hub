import mongoose from 'mongoose';
const MONGO_URI = 'mongodb://127.0.0.1:27017/smart-waste-hub';
console.log('🧹 Cleaning up database...');
await mongoose.connect(MONGO_URI);
await mongoose.connection.db.dropDatabase();
await mongoose.disconnect();
console.log('✅ Database dropped successfully');
