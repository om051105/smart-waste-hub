// Firebase CLIENT-SIDE config (for Google/Phone auth in the browser)
// Credentials are public — they are protected by Firebase Security Rules
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            "AIzaSyCU8Cs5rNqbu-tOAvUL1_JSsroDuhDe_sw",
  authDomain:        "smart-waste-hub.firebaseapp.com",
  projectId:         "smart-waste-hub",
  storageBucket:     "smart-waste-hub.firebasestorage.app",
  messagingSenderId: "664775555317",
  appId:             "1:664775555317:web:b2c2f06c8dbf1426c86dbc",
  measurementId:     "G-6Z01FTTJYW"
};

// Initialise only once (hot-reload safe)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup };
