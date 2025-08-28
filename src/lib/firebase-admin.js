import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Configuration Firebase Admin
let app;

if (!getApps().length) {
  try {
    // En production, utiliser les variables d'environnement
    app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID || "elite-5b171",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "elite-5b171.appspot.com"
    });
  } catch (error) {
    console.error('Erreur initialisation Firebase Admin:', error);
    // Fallback pour le développement local
    app = initializeApp({
      projectId: "elite-5b171",
      storageBucket: "elite-5b171.appspot.com"
    });
  }
} else {
  app = getApps()[0];
}

// Export des services Firebase Admin
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);

// Configuration Firestore
adminDb.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true
});

// Helper pour créer des tokens personnalisés
export async function createCustomToken(uid, claims = {}) {
  try {
    return await adminAuth.createCustomToken(uid, claims);
  } catch (error) {
    console.error('Erreur création token personnalisé:', error);
    throw error;
  }
}

// Helper pour vérifier les tokens ID
export async function verifyIdToken(idToken) {
  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Erreur vérification token:', error);
    throw error;
  }
}

// Helper pour créer/mettre à jour un utilisateur
export async function createOrUpdateUser(userData) {
  try {
    const { uid, email, displayName, photoURL, phoneNumber } = userData;
    
    // Vérifier si l'utilisateur existe
    let userRecord;
    try {
      userRecord = await adminAuth.getUser(uid);
      // Mettre à jour l'utilisateur existant
      userRecord = await adminAuth.updateUser(uid, {
        email,
        displayName,
        photoURL,
        phoneNumber
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Créer un nouvel utilisateur
        userRecord = await adminAuth.createUser({
          uid,
          email,
          displayName,
          photoURL,
          phoneNumber
        });
      } else {
        throw error;
      }
    }
    
    // Sauvegarder/mettre à jour dans Firestore
    await adminDb.collection('users').doc(uid).set({
      uid,
      email,
      displayName,
      photoURL,
      phoneNumber,
      updatedAt: new Date(),
      lastSeen: new Date(),
      isOnline: true
    }, { merge: true });
    
    return userRecord;
  } catch (error) {
    console.error('Erreur création/mise à jour utilisateur:', error);
    throw error;
  }
}

// Helper pour batch operations
export function createBatch() {
  return adminDb.batch();
}

// Helper pour les transactions
export async function runTransaction(updateFunction) {
  return adminDb.runTransaction(updateFunction);
}

export default app;