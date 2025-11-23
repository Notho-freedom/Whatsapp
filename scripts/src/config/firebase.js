import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDot5qXzscWMlJbT46Iq-ZNQRTLhicFCmU",
  authDomain: "elite-5b171.firebaseapp.com",
  projectId: "elite-5b171",
  storageBucket: "elite-5b171.appspot.com",
  messagingSenderId: "263142174492",
  appId: "1:263142174492:web:8d8abbe4bf5e831211d4d9",
  measurementId: "G-PDDCJR1CZ8"
};

// Initialiser Firebase seulement si pas déjà initialisé et côté client
let app;
if (typeof window !== 'undefined' && getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else if (typeof window !== 'undefined') {
  app = getApps()[0];
}

// Initialiser les services Firebase seulement si l'app existe
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;
export const auth = app ? getAuth(app) : null;

export default app;
