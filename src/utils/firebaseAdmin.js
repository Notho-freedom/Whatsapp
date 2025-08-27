// Firebase Admin SDK pour l'accès côté serveur
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configuration Firebase Admin simplifiée pour le développement
const firebaseAdminConfig = {
  projectId: "elite-5b171",
  // Pour le développement, on utilise l'authentification par défaut
  // En production, vous devriez utiliser une clé de service JSON
};

// Initialiser Firebase Admin seulement s'il n'est pas déjà initialisé
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseAdminConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export { db };
