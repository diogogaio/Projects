import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

export { db, auth };
