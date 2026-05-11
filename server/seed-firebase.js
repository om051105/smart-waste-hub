// Seed demo data into Firebase Firestore
// Usage: node server/seed-firebase.js
// Run ONCE after setting up Firebase

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') });

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT not found in .env');
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

console.log('🔥 Connected to Firebase Firestore');

// ── Seed Users ────────────────────────────────────────────────────────────────
const users = [
  { id: 'admin_seed_001', name: 'System Administrator', email: 'admin@wastewise.com', password: 'admin123', role: 'admin', complianceScore: 1000, rewardPoints: 500, area: '', createdAt: new Date().toISOString() },
  { id: 'citizen_seed_002', name: 'Jane Citizen', email: 'citizen@wastewise.com', password: 'citizen123', role: 'citizen', complianceScore: 85, rewardPoints: 120, area: 'Sector 14', createdAt: new Date().toISOString() },
  { id: 'worker_seed_003', name: 'Mike Worker', email: 'worker@wastewise.com', password: 'worker123', role: 'worker', complianceScore: 150, rewardPoints: 0, area: 'Zone A', createdAt: new Date().toISOString() },
];

for (const { id, ...data } of users) {
  await db.collection('users').doc(id).set(data);
}
console.log('✅ Users seeded');

// ── Seed Facilities ───────────────────────────────────────────────────────────
const facilities = [
  { name: 'Main Recycling Center', type: 'recycling', lat: 28.6139, lng: 77.2090, address: 'Sector 1, New Delhi' },
  { name: 'Organic Compost Hub', type: 'compost', lat: 28.6210, lng: 77.2150, address: 'Central Park Road' },
  { name: 'Plastic Recovery Plant', type: 'recycling', lat: 28.6050, lng: 77.1950, address: 'Industrial Area Phase II' },
];

await db.collection('facilities').doc('fac_001').set(facilities[0]);
await db.collection('facilities').doc('fac_002').set(facilities[1]);
await db.collection('facilities').doc('fac_003').set(facilities[2]);
console.log('✅ Facilities seeded');

// ── Seed Collections ──────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];
const collections = [
  { workerId: 'worker_seed_003', area: 'Sector 14 - Zone A', status: 'completed', date: today, households: 45, organicWeight: 30.4, plasticWeight: 16.9, metalWeight: 10.1 },
  { workerId: 'worker_seed_003', area: 'Sector 15 - Zone A', status: 'pending', date: today, households: 38 },
  { workerId: 'worker_seed_003', area: 'Sector 16 - Zone A', status: 'pending', date: today, households: 52 },
  { workerId: 'worker_seed_003', area: 'Sector 17 - Zone B', status: 'missed', date: today, households: 30 },
];

for (let i = 0; i < collections.length; i++) {
  await db.collection('collections').doc(`col_00${i + 1}`).set({
    ...collections[i], createdAt: new Date().toISOString()
  });
}
console.log('✅ Collections seeded');

// ── Seed Complaints ───────────────────────────────────────────────────────────
const complaints = [
  { userId: 'citizen_seed_002', userName: 'Jane Citizen', description: 'Overflowing garbage bin near Block 5', location: { lat: 28.612, lng: 77.208 }, status: 'pending', createdAt: new Date().toISOString() },
  { userId: 'citizen_seed_002', userName: 'Jane Citizen', description: 'Illegal dumping in the park', location: { lat: 28.618, lng: 77.202 }, status: 'in_progress', createdAt: new Date().toISOString() },
];

for (let i = 0; i < complaints.length; i++) {
  await db.collection('complaints').doc(`cmp_00${i + 1}`).set(complaints[i]);
}
console.log('✅ Complaints seeded');

console.log('\n🎉 Firebase Firestore seeding complete!');
console.log('🔐 Demo logins:');
console.log('   admin@wastewise.com    / admin123');
console.log('   citizen@wastewise.com  / citizen123');
console.log('   worker@wastewise.com   / worker123');
process.exit(0);
