import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// import { getAuth } from "firebase/auth"; // Add if needed later

// Neurotic Check: Ensure these environment variables are set in .env.local
// and prefixed with NEXT_PUBLIC_ for client-side access.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Add if analytics needed
};

// Validate required config keys are present
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("FATAL ERROR: Firebase configuration keys (apiKey, projectId) are missing.");
  console.error("Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID are set in your .env.local file.");
  // In a real app, you might throw an error or have fallback behavior.
  // For now, log error. The app might crash later when Firebase is used.
}

// Initialize Firebase for client-side
// Neurotic Check: Use singleton pattern to prevent HMR issues
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
// const auth = getAuth(app); // Add if needed later

console.log('Firebase client app initialized (ensure .env.local is populated).');

export { app, firestore /*, auth */ }; 