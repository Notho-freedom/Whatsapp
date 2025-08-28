import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getStorage, 
  connectStorageEmulator 
} from 'firebase/storage';
import { 
  getAnalytics, 
  isSupported as isAnalyticsSupported 
} from 'firebase/analytics';
import { 
  getPerformance,
  trace
} from 'firebase/performance';

// Configuration Firebase [[memory:7415125]]
const firebaseConfig = {
  apiKey: "AIzaSyDot5qXzscWMlJbT46Iq-ZNQRTLhicFCmU",
  authDomain: "elite-5b171.firebaseapp.com",
  projectId: "elite-5b171",
  storageBucket: "elite-5b171.appspot.com",
  messagingSenderId: "263142174492",
  appId: "1:263142174492:web:8d8abbe4bf5e831211d4d9",
  measurementId: "G-PDDCJR1CZ8"
};

// Initialisation Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics et Performance (uniquement côté client)
let analytics = null;
let performance = null;

if (typeof window !== 'undefined') {
  // Initialiser Analytics
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(console.error);
  
  // Initialiser Performance Monitoring
  try {
    performance = getPerformance(app);
  } catch (error) {
    console.warn('Performance monitoring non disponible:', error);
  }
  
  // Activer la persistance hors ligne
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Persistance impossible: multiple onglets ouverts');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistance non supportée par le navigateur');
    }
  });
}

// Connecter aux émulateurs en développement
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}

// Provider Google
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helpers d'authentification
export const authHelpers = {
  // Connexion email/password
  signIn: async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  // Inscription
  signUp: async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return userCredential;
  },
  
  // Connexion Google
  signInWithGoogle: async () => {
    return signInWithPopup(auth, googleProvider);
  },
  
  // Déconnexion
  signOut: async () => {
    return signOut(auth);
  },
  
  // Réinitialisation mot de passe
  resetPassword: async (email) => {
    return sendPasswordResetEmail(auth, email);
  },
  
  // Observer l'état d'authentification
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },
  
  // Obtenir le token ID actuel
  getIdToken: async (forceRefresh = false) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Utilisateur non connecté');
    return user.getIdToken(forceRefresh);
  }
};

// Helpers de performance
export const performanceHelpers = {
  // Créer une trace personnalisée
  startTrace: (name) => {
    if (!performance) return null;
    return trace(performance, name);
  },
  
  // Mesurer une opération async
  measureAsync: async (name, operation) => {
    const traceInstance = performanceHelpers.startTrace(name);
    if (traceInstance) traceInstance.start();
    
    try {
      const result = await operation();
      if (traceInstance) {
        traceInstance.putAttribute('success', 'true');
        traceInstance.stop();
      }
      return result;
    } catch (error) {
      if (traceInstance) {
        traceInstance.putAttribute('success', 'false');
        traceInstance.putAttribute('error', error.message);
        traceInstance.stop();
      }
      throw error;
    }
  }
};

// Gestion de la connexion réseau
export const networkHelpers = {
  // Activer le mode hors ligne
  goOffline: async () => {
    await disableNetwork(db);
  },
  
  // Réactiver le mode en ligne
  goOnline: async () => {
    await enableNetwork(db);
  },
  
  // Nettoyer le cache local
  clearCache: async () => {
    await clearIndexedDbPersistence(db);
  }
};

export { analytics, performance };
export default app;