import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Configuration Firebase pour le projet elite-5b171
const firebaseConfig = {
  apiKey: "AIzaSyDot5qXzscWMlJbT46Iq-ZNQRTLhicFCmU",
  authDomain: "elite-5b171.firebaseapp.com",
  projectId: "elite-5b171",
  storageBucket: "elite-5b171.appspot.com",
  messagingSenderId: "263142174492",
  appId: "1:263142174492:web:8d8abbe4bf5e831211d4d9",
  measurementId: "G-PDDCJR1CZ8"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Configuration des émulateurs en développement
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  try {
    // Connecter aux émulateurs Firebase
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    
    console.log('✅ Connecté aux émulateurs Firebase');
  } catch (error) {
    console.warn('⚠️ Impossible de se connecter aux émulateurs:', error.message);
  }
}

export default app;