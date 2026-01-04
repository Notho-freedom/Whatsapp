// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  off,
  push,
  update,
  remove,
} from 'firebase/database'; // Added for Realtime Database
import { getStorage } from 'firebase/storage'; // Added for Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDot5qXzscWMlJbT46Iq-ZNQRTLhicFCmU',
  authDomain: 'elite-5b171.firebaseapp.com',
  projectId: 'elite-5b171',
  storageBucket: 'elite-5b171.firebasestorage.app',
  messagingSenderId: '263142174492',
  appId: '1:263142174492:web:8d8abbe4bf5e831211d4d9',
  measurementId: 'G-PDDCJR1CZ8',
  databaseURL:
    'https://elite-5b171-default-rtdb.europe-west1.firebasedatabase.app', // Added
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app); // Added for Realtime Database
const storage = getStorage(app); // Added for Firebase Storage

export { app, analytics, db, auth, database, storage }; // Exported storage
