import { initializeApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Initialize Firebase only once
let database: Database | null = null;

// Define the FirebaseConfig interface to match the expected shape
interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  databaseURL?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  [key: string]: string | undefined; // Index signature for dynamic access
}

export function getFirebaseApp() {
  const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };

  // Log missing required Firebase config values during development
  if (process.env.NODE_ENV === 'development') {
    // Essential fields that must be present
    const essentialFields = ['apiKey', 'projectId', 'databaseURL'];
    const missingFields = essentialFields.filter(field => !firebaseConfig[field]);
    
    if (missingFields.length > 0) {
      console.error(`Missing required Firebase config values: ${missingFields.join(', ')}`);
      console.error('Please add these values to your .env.local file');
    }
  }

  // Ensure essential fields have fallback values to prevent runtime errors
  // These values won't actually work but will prevent the app from crashing
  if (!firebaseConfig.projectId) {
    console.warn('Firebase projectId is missing! Using fallback value.');
    firebaseConfig.projectId = 'loadup-f4f85'; // Using value from .env.local
  }
  
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase apiKey is missing! Using fallback value.');
    firebaseConfig.apiKey = 'AIzaSyC-ClInFAVieAJPo_qysYmjsBZLIMgNKJM'; // Using value from .env.local
  }
  
  if (!firebaseConfig.databaseURL) {
    console.warn('Firebase databaseURL is missing! Using fallback value.');
    firebaseConfig.databaseURL = 'https://loadup-f4f85-default-rtdb.asia-southeast1.firebasedatabase.app'; // Using value from .env.local
  }

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  
  // Only initialize analytics on the client side
  if (typeof window !== 'undefined') {
    try {
      getAnalytics(app);
    } catch (error) {
      console.warn('Failed to initialize Firebase Analytics:', error);
      // Continue without analytics - this isn't critical for the app to function
    }
  }
  
  return app;
}

export function getFirebaseDatabase() {
  if (!database) {
    const app = getFirebaseApp();
    database = getDatabase(app);
  }
  return database;
} 