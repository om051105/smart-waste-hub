import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let db = null;

export const initFirebase = () => {
  if (getApps().length > 0) {
    db = getFirestore();
    return db;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env variable is not set');

  const serviceAccount = JSON.parse(raw);

  initializeApp({
    credential: cert(serviceAccount),
  });

  db = getFirestore();
  console.log('✅ Firebase Admin initialized');
  return db;
};

export const getDB = () => {
  if (!db) return initFirebase();
  return db;
};

export { FieldValue };
